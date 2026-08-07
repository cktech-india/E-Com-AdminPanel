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
@Table(name = "cart_item_t",uniqueConstraints = {
        @UniqueConstraint(name = "uni_cart_item_t_company_product_user", columnNames = {"company_code","product_id","user_id"}),
})
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CartItemDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", length = 50)
    private String companyCode;

    @Column(name = "cart_id")
    private Long cartId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @CacheLookup(category = "product", codeField = "productId")
    @Transient
    private String productCode;
}
