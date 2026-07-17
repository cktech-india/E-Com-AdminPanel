package com.cktech.ecom.model.inventory;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "inventory_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class InventoryDTO extends Auditable {

    @Id
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity;

    @Column(name = "reorder_level")
    private Integer reorderLevel;
}