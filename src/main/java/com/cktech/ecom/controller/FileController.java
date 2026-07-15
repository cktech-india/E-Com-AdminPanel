package com.cktech.ecom.controller;

import com.cktech.ecom.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/file")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Get pre-signed S3 URL or simulated local URL.
     */
    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam("filePath") String filePath,
            @RequestParam("fileName") String fileName,
            HttpServletRequest request) {

        String uploadUrl = fileStorageService.getPresignedUploadUrl(filePath, fileName);
        
        // If uploadUrl is local fallback relative path, convert to absolute url
        if (uploadUrl.startsWith("/api/file")) {
            String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
            uploadUrl = baseUrl + uploadUrl;
        }

        // Generate absolute download URL
        String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
        String fileUrl = baseUrl + "/api/file/my-file?filePath=" + 
                URLEncode(filePath + (filePath.endsWith("/") ? "" : "/") + fileName);

        if (fileStorageService.isS3Active()) {
            // S3 resolved URL directly
            fileUrl = fileStorageService.getPresignedUploadUrl(filePath, fileName).split("\\?")[0];
        }

        Map<String, String> response = new HashMap<>();
        response.put("uploadUrl", uploadUrl);
        response.put("fileUrl", fileUrl);

        return ResponseEntity.ok(response);
    }

    /**
     * Fallback endpoint simulating direct binary uploads (PUT) to pre-signed S3 URLs.
     */
    @RequestMapping(value = "/upload-local", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<Map<String, String>> uploadLocal(
            @RequestParam("filePath") String filePath,
            HttpServletRequest request) {
        try {
            byte[] fileBytes = request.getInputStream().readAllBytes();
            
            // Extract path and name
            String parentPath = "";
            String fileName = filePath;
            if (filePath.contains("/")) {
                parentPath = filePath.substring(0, filePath.lastIndexOf("/"));
                fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
            }

            fileStorageService.uploadFile(parentPath, fileName, fileBytes);

            Map<String, String> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("filePath", filePath);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Standard file upload (multipart).
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMultipart(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "filePath", defaultValue = "") String filePath) {
        try {
            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.isEmpty()) {
                fileName = "uploaded_file_" + System.currentTimeMillis();
            }

            fileStorageService.uploadFile(filePath, fileName, file.getBytes());

            Map<String, String> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("fileName", fileName);
            response.put("filePath", filePath + (filePath.endsWith("/") || filePath.isEmpty() ? "" : "/") + fileName);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lists all files in the repository. Matches frontend layout requirements.
     */
    @GetMapping("/file-path-list")
    public ResponseEntity<List<Map<String, String>>> getFilePathList() {
        List<String> rawPaths = fileStorageService.listFiles();
        List<Map<String, String>> mapped = rawPaths.stream()
                .map(path -> {
                    Map<String, String> m = new HashMap<>();
                    m.put("filePath", path);
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(mapped);
    }

    /**
     * Serves file binary streams.
     */
    @GetMapping("/my-file")
    public ResponseEntity<byte[]> getFile(@RequestParam("filePath") String filePath) {
        try {
            String decodedPath = URLDecoder.decode(filePath, StandardCharsets.UTF_8);
            byte[] fileBytes = fileStorageService.getFile(decodedPath);
            
            String extension = decodedPath.substring(decodedPath.lastIndexOf(".") + 1).toLowerCase();
            MediaType mediaType = getMediaType(extension);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + 
                            decodedPath.substring(decodedPath.lastIndexOf("/") + 1) + "\"")
                    .body(fileBytes);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deletes files from S3/local. Decodes Base64 inputs sent by UI.
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteFile(
            @RequestParam("fileName") String base64FileName,
            @RequestParam("filePath") String base64FilePath) {

        String fileName = new String(Base64.getDecoder().decode(base64FileName), StandardCharsets.UTF_8);
        String filePath = new String(Base64.getDecoder().decode(base64FilePath), StandardCharsets.UTF_8);

        if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
        }
        if (!filePath.isEmpty() && !filePath.endsWith("/")) {
            filePath = filePath + "/";
        }

        String fullPath = filePath + fileName;
        fileStorageService.deleteFile(fullPath);

        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "File deleted successfully");
        return ResponseEntity.ok(response);
    }

    private MediaType getMediaType(String extension) {
        switch (extension) {
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "gif":
                return MediaType.IMAGE_GIF;
            case "webp":
                return MediaType.parseMediaType("image/webp");
            case "svg":
                return MediaType.parseMediaType("image/svg+xml");
            case "pdf":
                return MediaType.APPLICATION_PDF;
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private String URLEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            return value;
        }
    }
}
