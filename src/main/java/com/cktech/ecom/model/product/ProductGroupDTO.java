package com.cktech.ecom.model.product;

import com.cktech.ecom.config.cache.CacheLookup;
import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "product_group_t")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ProductGroupDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "group_name", nullable = false, length = 50)
    private String groupName;

    @Column(name = "group_value", nullable = false, length = 50)
    private String groupValue;

    @CacheLookup(category = "product", codeField = "productId")
    @Transient
    private String productCode;

}