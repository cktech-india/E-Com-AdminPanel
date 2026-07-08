package com.cktech.ecom.model.product;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "product_reviews_t")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ProductReviewDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code")
    private String companyCode;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "review_title")
    private String reviewTitle;

    @Lob
    @Column(name = "review_text")
    private String reviewText;

}