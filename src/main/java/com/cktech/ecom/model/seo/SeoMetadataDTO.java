package com.cktech.ecom.model.seo;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "seo_metadata_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class SeoMetadataDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "target_value", nullable = false, length = 255)
    private String targetValue;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description")
    private String metaDescription;

    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "og_title")
    private String ogTitle;

    @Column(name = "og_description")
    private String ogDescription;

    @Column(name = "og_image_url")
    private String ogImageUrl;
}
