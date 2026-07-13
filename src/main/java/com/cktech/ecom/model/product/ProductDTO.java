package com.cktech.ecom.model.product;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
public class ProductDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code")
    private String companyCode;

    @Column(name = "product_code")
    private String productCode;

    @Column(name = "group_code")
    private String groupCode;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "parent_product_id")
    private Long parentProductId;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "product_name")
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Double price;

    @Column(name = "product_type")
    private String productType;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Column(name = "is_tax_inclusive")
    private Boolean isTaxInclusive;

    @Column(name = "tax_category_id")
    private Long taxCategoryId;
}