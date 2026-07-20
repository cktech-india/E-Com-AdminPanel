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

import com.cktech.ecom.model.country.CountryDTO;
import com.cktech.ecom.model.tax.TaxCategoryDTO;
import com.cktech.ecom.model.tax.GstHsnCodeDTO;
import com.cktech.ecom.model.state.StateDTO;

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
    private final CountryService countryService;
    private final TaxCategoryService taxCategoryService;
    private final GstHsnCodeService gstHsnCodeService;
    private final StateService stateService;
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
            CountryService countryService,
            TaxCategoryService taxCategoryService,
            GstHsnCodeService gstHsnCodeService,
            StateService stateService,
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
        this.countryService = countryService;
        this.taxCategoryService = taxCategoryService;
        this.gstHsnCodeService = gstHsnCodeService;
        this.stateService = stateService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/columns/{entityType}")
    public ResponseEntity<?> getColumns(@PathVariable String entityType) {
        try {
            Class<?> clazz = getClassForEntityType(entityType);
            List<Map<String, String>> columns = getFieldsForClass(clazz);
            return ResponseEntity.ok(columns);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            LOG.error("Failed to get columns for entity type: {}", entityType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve columns: " + e.getMessage()));
        }
    }

    @PostMapping("/export/{entityType}/{format}")
    public ResponseEntity<byte[]> exportData(
            @PathVariable String entityType,
            @PathVariable String format,
            @RequestBody List<Map<String, Object>> data) {
        try {
            Class<?> clazz = getClassForEntityType(entityType);
            List<Map<String, String>> columns = getFieldsForClass(clazz);
            
            byte[] fileBytes;
            String filename = entityType.toLowerCase() + "_list." + format.toLowerCase();
            String contentType;
            
            if ("csv".equalsIgnoreCase(format)) {
                fileBytes = generateCsv(columns, data);
                contentType = "text/csv";
            } else if ("xlsx".equalsIgnoreCase(format)) {
                fileBytes = generateExcel(columns, data, entityType);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else {
                throw new IllegalArgumentException("Unsupported format: " + format);
            }
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename(filename).build());
            headers.setContentType(org.springframework.http.MediaType.parseMediaType(contentType));
            
            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            LOG.error("Error exporting data for: {}", entityType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private byte[] generateCsv(List<Map<String, String>> columns, List<Map<String, Object>> data) {
        StringBuilder sb = new StringBuilder();
        // Header row
        for (int i = 0; i < columns.size(); i++) {
            sb.append(columns.get(i).get("header"));
            if (i < columns.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("\n");
        
        // Data rows
        for (Map<String, Object> row : data) {
            for (int i = 0; i < columns.size(); i++) {
                String colName = columns.get(i).get("column");
                Object val = row.get(colName);
                String valStr = "";
                if (val != null) {
                    if (val instanceof Boolean) {
                        valStr = (Boolean) val ? "Yes" : "No";
                    } else {
                        valStr = String.valueOf(val).replace("\"", "\"\"");
                    }
                }
                sb.append("\"").append(valStr).append("\"");
                if (i < columns.size() - 1) {
                    sb.append(",");
                }
            }
            sb.append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] generateExcel(List<Map<String, String>> columns, List<Map<String, Object>> data, String entityName) throws Exception {
        try (Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
             
            Sheet sheet = workbook.createSheet(entityName);
            
            // Header Row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_80_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            for (int i = 0; i < columns.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns.get(i).get("header"));
                cell.setCellStyle(headerStyle);
            }
            
            // Data Rows
            int rowIdx = 1;
            for (Map<String, Object> row : data) {
                Row excelRow = sheet.createRow(rowIdx++);
                for (int i = 0; i < columns.size(); i++) {
                    String colName = columns.get(i).get("column");
                    Object val = row.get(colName);
                    Cell cell = excelRow.createCell(i);
                    if (val != null) {
                        if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                        } else if (val instanceof Boolean) {
                            cell.setCellValue((Boolean) val ? "Yes" : "No");
                        } else {
                            cell.setCellValue(String.valueOf(val));
                        }
                    } else {
                        cell.setCellValue("");
                    }
                }
            }
            
            // Auto size columns
            for (int i = 0; i < columns.size(); i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private Class<?> getClassForEntityType(String entityType) {
        switch (entityType.toLowerCase()) {
            case "product": return ProductDTO.class;
            case "category": return CategoryDTO.class;
            case "company": return CompanyDTO.class;
            case "branch": return BranchDTO.class;
            case "tax-rate": return TaxRateDTO.class;
            case "faq": return FaqDTO.class;
            case "discount": return DiscountDTO.class;
            case "inventory": return InventoryDTO.class;
            case "seo-config": return SeoMetadataDTO.class;
            case "product-group": return ProductGroupDTO.class;
            case "product-tag": return ProductTagDTO.class;
            case "product-media": return ProductMediaDTO.class;
            case "country": return CountryDTO.class;
            case "tax-category": return TaxCategoryDTO.class;
            case "gst-hsn-code": return GstHsnCodeDTO.class;
            case "state": return StateDTO.class;
            default: throw new IllegalArgumentException("Unsupported entity type: " + entityType);
        }
    }

    private List<Map<String, String>> getFieldsForClass(Class<?> clazz) {
        List<Map<String, String>> fieldsList = new ArrayList<>();
        Set<String> fieldNames = new HashSet<>();
        
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            java.lang.reflect.Field[] fields = current.getDeclaredFields();
            for (java.lang.reflect.Field field : fields) {
                String name = field.getName();
                
                // Skip specific excluded ones
                if (name.equals("companyCode") || name.equals("createdBy") || name.equals("createdDate") || 
                    name.equals("modifiedBy") || name.equals("modifiedDate") || name.equals("recordMode") || name.equals("currentUser")) {
                    continue;
                }
                
                // Skip if already added
                if (fieldNames.contains(name)) {
                    continue;
                }
                
                // Keep isDeleted (ignore JSONIgnore/Transient checks for it)
                if (!name.equals("isDeleted")) {
                    if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) || 
                        java.lang.reflect.Modifier.isTransient(field.getModifiers()) ||
                        field.isAnnotationPresent(jakarta.persistence.Transient.class) ||
                        field.isAnnotationPresent(com.fasterxml.jackson.annotation.JsonIgnore.class)) {
                        continue;
                    }
                }
                
                fieldNames.add(name);
                
                Map<String, String> fieldMap = new LinkedHashMap<>();
                fieldMap.put("column", name);
                fieldMap.put("header", convertCamelCaseToTitle(name));
                fieldsList.add(fieldMap);
            }
            current = current.getSuperclass();
        }
        return fieldsList;
    }

    private String convertCamelCaseToTitle(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        if (name.equalsIgnoreCase("id")) {
            return "ID";
        }
        StringBuilder result = new StringBuilder();
        result.append(Character.toUpperCase(name.charAt(0)));
        for (int i = 1; i < name.length(); i++) {
            char ch = name.charAt(i);
            if (Character.isUpperCase(ch)) {
                result.append(" ").append(ch);
            } else {
                result.append(ch);
            }
        }
        return result.toString();
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
            case "country":
                CountryDTO country = objectMapper.convertValue(record, CountryDTO.class);
                return countryService.save(country);
            case "tax-category":
                TaxCategoryDTO taxCategory = objectMapper.convertValue(record, TaxCategoryDTO.class);
                return taxCategoryService.save(taxCategory);
            case "gst-hsn-code":
                GstHsnCodeDTO gstHsnCode = objectMapper.convertValue(record, GstHsnCodeDTO.class);
                return gstHsnCodeService.save(gstHsnCode);
            case "state":
                StateDTO state = objectMapper.convertValue(record, StateDTO.class);
                return stateService.save(state);
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
