package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.ProductDTO;
import com.cktech.ecom.model.category.CategoryDTO;
import com.cktech.ecom.model.company.CompanyDTO;
import com.cktech.ecom.model.branch.BranchDTO;
import com.cktech.ecom.model.tax.TaxRateDTO;
import com.cktech.ecom.model.faq.FaqDTO;
import com.cktech.ecom.model.product.DiscountDTO;
import com.cktech.ecom.model.inventory.InventoryDTO;
import com.cktech.ecom.model.seo.SeoMetadataDTO;
import com.cktech.ecom.model.product.ProductGroupDTO;
import com.cktech.ecom.model.product.ProductTagDTO;
import com.cktech.ecom.model.product.ProductMediaDTO;

import com.cktech.ecom.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/data-import")
public class DataImportExportController {

    private static final Logger LOG = LoggerFactory.getLogger(DataImportExportController.class);

    private final ProductService productService;
    private final CategoryService categoryService;
    private final CompanyService companyService;
    private final BranchService branchService;
    private final TaxRateService taxRateService;
    private final FaqService faqService;
    private final DiscountService discountService;
    private final InventoryService inventoryService;
    private final SeoMetadataService seoMetadataService;
    private final ProductGroupService productGroupService;
    private final ProductTagService productTagService;
    private final ProductMediaService productMediaService;
    private final ObjectMapper objectMapper;

    public DataImportExportController(
            ProductService productService,
            CategoryService categoryService,
            CompanyService companyService,
            BranchService branchService,
            TaxRateService taxRateService,
            FaqService faqService,
            DiscountService discountService,
            InventoryService inventoryService,
            SeoMetadataService seoMetadataService,
            ProductGroupService productGroupService,
            ProductTagService productTagService,
            ProductMediaService productMediaService,
            ObjectMapper objectMapper) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.companyService = companyService;
        this.branchService = branchService;
        this.taxRateService = taxRateService;
        this.faqService = faqService;
        this.discountService = discountService;
        this.inventoryService = inventoryService;
        this.seoMetadataService = seoMetadataService;
        this.productGroupService = productGroupService;
        this.productTagService = productTagService;
        this.productMediaService = productMediaService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/preview")
    public ResponseEntity<?> previewFile(@RequestParam("file") MultipartFile file) {
        try {
            String filename = file.getOriginalFilename();
            if (filename == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Filename cannot be empty"));
            }

            List<Map<String, String>> rows = new ArrayList<>();
            if (filename.endsWith(".csv")) {
                rows = parseCsv(file.getInputStream());
            } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                rows = parseExcel(file.getInputStream());
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported file type. Please upload CSV or Excel."));
            }

            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            LOG.error("Failed to parse upload file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to parse file: " + e.getMessage()));
        }
    }

    @PostMapping("/save/{entityType}")
    public ResponseEntity<?> saveRecords(
            @PathVariable String entityType,
            @RequestBody List<Map<String, Object>> records) {
        try {
            List<Object> savedList = new ArrayList<>();
            for (Map<String, Object> record : records) {
                Object saved = convertAndSave(entityType, record);
                if (saved != null) {
                    savedList.add(saved);
                }
            }
            return ResponseEntity.ok(savedList);
        } catch (Exception e) {
            LOG.error("Error saving imported records for type: {}", entityType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error storing data: " + e.getMessage()));
        }
    }

    private Object convertAndSave(String entityType, Map<String, Object> record) {
        switch (entityType.toLowerCase()) {
            case "product":
                ProductDTO product = objectMapper.convertValue(record, ProductDTO.class);
                return productService.save(product);
            case "category":
                CategoryDTO category = objectMapper.convertValue(record, CategoryDTO.class);
                return categoryService.save(category);
            case "company":
                CompanyDTO company = objectMapper.convertValue(record, CompanyDTO.class);
                return companyService.save(company);
            case "branch":
                BranchDTO branch = objectMapper.convertValue(record, BranchDTO.class);
                return branchService.save(branch);
            case "tax-rate":
                TaxRateDTO taxRate = objectMapper.convertValue(record, TaxRateDTO.class);
                return taxRateService.save(taxRate);
            case "faq":
                FaqDTO faq = objectMapper.convertValue(record, FaqDTO.class);
                return faqService.save(faq);
            case "discount":
                DiscountDTO discount = objectMapper.convertValue(record, DiscountDTO.class);
                return discountService.save(discount);
            case "inventory":
                InventoryDTO inventory = objectMapper.convertValue(record, InventoryDTO.class);
                return inventoryService.save(inventory);
            case "seo-config":
                SeoMetadataDTO seo = objectMapper.convertValue(record, SeoMetadataDTO.class);
                return seoMetadataService.save(seo);
            case "product-group":
                ProductGroupDTO productGroup = objectMapper.convertValue(record, ProductGroupDTO.class);
                return productGroupService.save(productGroup);
            case "product-tag":
                ProductTagDTO productTag = objectMapper.convertValue(record, ProductTagDTO.class);
                return productTagService.save(productTag);
            case "product-media":
                ProductMediaDTO productMedia = objectMapper.convertValue(record, ProductMediaDTO.class);
                return productMediaService.save(productMedia);
            default:
                throw new IllegalArgumentException("Unsupported entity type: " + entityType);
        }
    }

    private List<Map<String, String>> parseCsv(InputStream is) throws Exception {
        List<Map<String, String>> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return list;

            List<String> headers = parseCsvLine(headerLine);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                List<String> values = parseCsvLine(line);
                Map<String, String> row = new LinkedHashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    String val = i < values.size() ? values.get(i) : "";
                    row.put(headers.get(i), val);
                }
                list.add(row);
            }
        }
        return list;
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder curVal = new StringBuilder();
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '\"') {
                inQuotes = !inQuotes;
            } else if (ch == ',') {
                if (inQuotes) {
                    curVal.append(ch);
                } else {
                    result.add(curVal.toString().trim());
                    curVal.setLength(0);
                }
            } else {
                curVal.append(ch);
            }
        }
        result.add(curVal.toString().trim());
        return result;
    }

    private List<Map<String, String>> parseExcel(InputStream is) throws Exception {
        List<Map<String, String>> list = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return list;

            List<String> headers = new ArrayList<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                headers.add(cell != null ? getCellValueAsString(cell) : "Column_" + i);
            }

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Map<String, String> rowData = new LinkedHashMap<>();
                boolean hasData = false;
                for (int c = 0; c < headers.size(); c++) {
                    Cell cell = row.getCell(c);
                    String val = cell != null ? getCellValueAsString(cell) : "";
                    if (!val.trim().isEmpty()) {
                        hasData = true;
                    }
                    rowData.put(headers.get(c), val);
                }
                if (hasData) {
                    list.add(rowData);
                }
            }
        }
        return list;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double num = cell.getNumericCellValue();
                if (num == (long) num) {
                    return String.format("%d", (long) num);
                } else {
                    return String.valueOf(num);
                }
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}
