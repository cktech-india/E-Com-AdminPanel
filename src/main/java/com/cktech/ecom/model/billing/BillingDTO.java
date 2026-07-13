package com.cktech.ecom.model.billing;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "billing_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class BillingDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false)
    private String companyCode;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_address", nullable = false, length = 1000)
    private String customerAddress;

    @Column(name = "mobile_no", nullable = false)
    private String mobileNo;

    @Column(nullable = false)
    private String state;

    @Column(name = "state_code", nullable = false)
    private String stateCode;

    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Column(name = "igst")
    private Double igst;

    @Column(name = "cgst")
    private Double cgst;

    @Column(name = "sgst")
    private Double sgst;

    @Column(name = "grand_total", nullable = false)
    private Double grandTotal;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}