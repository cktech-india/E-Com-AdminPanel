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
@Table(name = "wishlist_t",uniqueConstraints = {
        @UniqueConstraint(name = "wishlist_t_product_user", columnNames = {"product_id","user_id"}),
})
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class WishlistDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 5)
    private String companyCode;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "user_id")
    private Long userId;
    //@CacheLookup(category = "product", codeField = "productId")
    @Transient
    private String productName;
    @CacheLookup(category = "product", codeField = "productId")
    @Transient
    private String productCode;
}
