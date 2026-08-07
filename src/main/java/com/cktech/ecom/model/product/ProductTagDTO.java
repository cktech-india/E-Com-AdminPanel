package com.cktech.ecom.model.product;


import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_tags_t",uniqueConstraints = {
        @UniqueConstraint(name = "uni_prouct_tags_t_company_product_tag", columnNames = {"company_code","product_id","product_tag"}),
})
@EqualsAndHashCode(callSuper = false)
public class ProductTagDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_tag", nullable = false, length = 50)
    private String productTag;

}