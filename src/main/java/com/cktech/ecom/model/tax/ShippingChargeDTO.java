package com.cktech.ecom.model.tax;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "shipping_charges_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class ShippingChargeDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 20)
    private String size;

    @Column(name = "same_state_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal sameStateCharge;

    @Column(name = "other_state_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal otherStateCharge;

    @Column(length = 1)
    private String status = "A";
    
}