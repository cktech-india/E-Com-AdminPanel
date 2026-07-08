package com.cktech.ecom.model.billingdetails;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "billing_details_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class BillingDetailsDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false)
    private String companyCode;

    @Column(name = "billing_id", nullable = false)
    private Long billingId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column
    private Double quantity;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column
    private Double cgst;

    @Column
    private Double igst;

    @Column
    private Double sgst;

    @Column(name = "gst_amount")
    private Double gstAmount;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "row_total")
    private Double rowTotal;
}