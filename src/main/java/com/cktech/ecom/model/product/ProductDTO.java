package com.cktech.ecom.model.product;

import com.cktech.ecom.common.MasterDataEntityListener;
import com.cktech.ecom.config.MasterCacheConfig;
import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "products_t")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@MasterCacheConfig(category = "product", codeField = "id" , nameField = "productCode")
@EntityListeners(MasterDataEntityListener.class)
public class ProductDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "product_code", nullable = false, length = 50)
    private String productCode;

    @Column(name = "parent_product_id")
    private Long parentProductId;

    @Column(name = "category_id", length = 50)
    private String categoryId;

    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(length = 255)
    private String description;

    @Column
    private Double price;

    @Column(name = "product_type", length = 100)
    private String productType;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "hsn_code", length = 255)
    private String hsnCode;

    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Column(name = "is_tax_inclusive")
    private Boolean isTaxInclusive;

    @Column(name = "tax_category_id")
    private Long taxCategoryId;

    @Column(name = "product_summary", length = 500)
    private String productSummary;
}