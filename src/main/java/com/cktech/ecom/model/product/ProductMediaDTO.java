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
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import com.cktech.ecom.common.AppEnum;

@Data
@Entity
@Table(name = "product_media_t")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ProductMediaDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private AppEnum.MEDIA_TYPE mediaType;

    @Column(name = "media_url", nullable = false, length = 255)
    private String mediaUrl;

}