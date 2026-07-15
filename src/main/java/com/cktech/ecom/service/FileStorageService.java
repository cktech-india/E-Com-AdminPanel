package com.cktech.ecom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${aws.s3.bucket:}")
    private String bucketName;

    @Value("${aws.s3.region:us-east-1}")
    private String regionStr;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${store.type:LOC}")
    private String storeType;

    @Value("${file.local-dir:uploads}")
    private String localDir;

    private S3Client s3Client;
    private S3Presigner s3Presigner;
    private boolean isS3Configured = false;

    @PostConstruct
    public void init() {
        // Create local directories
        try {
            Files.createDirectories(Paths.get(localDir));
            Files.createDirectories(Paths.get(localDir, "cache"));
        } catch (IOException e) {
            System.err.println("Failed to create local upload directories: " + e.getMessage());
        }

        // Initialize S3 if storeType is S3 and credentials are provided
        if ("S3".equalsIgnoreCase(storeType) &&
            bucketName != null && !bucketName.trim().isEmpty() && 
            accessKey != null && !accessKey.trim().isEmpty() && 
            secretKey != null && !secretKey.trim().isEmpty()) {
            try {
                Region region = Region.of(regionStr);
                StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                );

                this.s3Client = S3Client.builder()
                        .region(region)
                        .credentialsProvider(credentialsProvider)
                        .build();

                this.s3Presigner = S3Presigner.builder()
                        .region(region)
                        .credentialsProvider(credentialsProvider)
                        .build();

                this.isS3Configured = true;
                System.out.println("AWS S3 storage initialized successfully. Bucket: " + bucketName);
            } catch (Exception e) {
                System.err.println("Failed to initialize AWS S3 storage, falling back to local files: " + e.getMessage());
                this.isS3Configured = false;
            }
        } else {
            System.out.println("Local storage mode (LOC) is active or AWS S3 configs are missing.");
            this.isS3Configured = false;
        }
    }

    public boolean isS3Active() {
        return isS3Configured;
    }

    /**
     * Generates a pre-signed S3 URL for PUT upload, or a local server upload URL fallback.
     */
    public String getPresignedUploadUrl(String filePath, String fileName) {
        String fullPath = normalizePath(filePath, fileName);

        if (isS3Configured) {
            try {
                PutObjectRequest objectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fullPath)
                        .build();

                PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(15))
                        .putObjectRequest(objectRequest)
                        .build();

                PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
                return presignedRequest.url().toString();
            } catch (Exception e) {
                System.err.println("Failed to generate presigned S3 url, fallback to local url: " + e.getMessage());
            }
        }

        // Local upload URL fallback
        return "/api/file/upload-local?filePath=" + fullPath;
    }

    /**
     * Uploads/Saves file.
     */
    public String uploadFile(String filePath, String fileName, byte[] content) {
        String fullPath = normalizePath(filePath, fileName);

        // 1. Write to local cache first
        saveToLocalCache(fullPath, content);

        // 2. Upload to S3 if active
        if (isS3Configured) {
            try {
                s3Client.putObject(
                        PutObjectRequest.builder().bucket(bucketName).key(fullPath).build(),
                        software.amazon.awssdk.core.sync.RequestBody.fromBytes(content)
                );
                System.out.println("File uploaded to S3: " + fullPath);
            } catch (Exception e) {
                System.err.println("Failed to upload to S3: " + e.getMessage());
            }
        }

        return fullPath;
    }

    /**
     * Reads file content. Implements caching logic: checks local cache first, downloads from S3 if missing.
     */
    public byte[] getFile(String fullPath) throws IOException {
        Path localPath = Paths.get(localDir, "cache", fullPath);

        // Check local cache
        if (Files.exists(localPath)) {
            return Files.readAllBytes(localPath);
        }

        // If not in local cache but S3 is configured, fetch from S3
        if (isS3Configured) {
            try {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fullPath)
                        .build();

                ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
                byte[] content = objectBytes.asByteArray();

                // Save to local cache for future reads
                saveToLocalCache(fullPath, content);
                return content;
            } catch (NoSuchKeyException e) {
                throw new IOException("File not found in S3: " + fullPath);
            } catch (Exception e) {
                throw new IOException("Error fetching file from S3: " + e.getMessage(), e);
            }
        }

        throw new IOException("File not found locally or in S3: " + fullPath);
    }

    /**
     * Deletes file from local cache and S3.
     */
    public void deleteFile(String fullPath) {
        // Delete from local cache
        try {
            Path localPath = Paths.get(localDir, "cache", fullPath);
            Files.deleteIfExists(localPath);
        } catch (IOException e) {
            System.err.println("Failed to delete local cache file: " + e.getMessage());
        }

        // Delete from S3 if active
        if (isS3Configured) {
            try {
                s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(fullPath).build());
                System.out.println("Deleted file from S3: " + fullPath);
            } catch (Exception e) {
                System.err.println("Failed to delete file from S3: " + e.getMessage());
            }
        }
    }

    /**
     * Lists all uploaded file paths (S3 keys + local files) for the frontend file-repository.
     */
    public List<String> listFiles() {
        List<String> files = new ArrayList<>();

        // 1. Scan S3 if active
        if (isS3Configured) {
            try {
                ListObjectsV2Response listObjectsResponse = s3Client.listObjectsV2(
                        ListObjectsV2Request.builder().bucket(bucketName).build()
                );
                for (S3Object s3Object : listObjectsResponse.contents()) {
                    files.add(s3Object.key());
                }
                return files;
            } catch (Exception e) {
                System.err.println("Failed to list S3 objects, falling back to local files scan: " + e.getMessage());
            }
        }

        // 2. Fallback scan local cache directory
        try {
            Path cachePath = Paths.get(localDir, "cache");
            if (Files.exists(cachePath)) {
                Files.walk(cachePath)
                        .filter(Files::isRegularFile)
                        .forEach(path -> {
                            String relative = cachePath.relativize(path).toString().replace('\\', '/');
                            files.add(relative);
                        });
            }
        } catch (IOException e) {
            System.err.println("Failed to scan local file cache directory: " + e.getMessage());
        }

        return files;
    }

    private void saveToLocalCache(String fullPath, byte[] content) {
        try {
            Path cachePath = Paths.get(localDir, "cache", fullPath);
            Files.createDirectories(cachePath.getParent());
            Files.write(cachePath, content);
        } catch (IOException e) {
            System.err.println("Failed to write file to local cache: " + e.getMessage());
        }
    }

    private String normalizePath(String path, String name) {
        String cleanPath = path == null ? "" : path.trim();
        String cleanName = name == null ? "" : name.trim();

        if (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }
        if (cleanPath.endsWith("/")) {
            cleanPath = cleanPath.substring(0, cleanPath.length() - 1);
        }

        if (cleanPath.isEmpty()) {
            return cleanName;
        }
        return cleanPath + "/" + cleanName;
    }
}
