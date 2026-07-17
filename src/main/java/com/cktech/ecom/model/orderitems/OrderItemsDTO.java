package com.cktech.ecom.model.orderitems;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "order_items_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemsDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_sku", nullable = false)
    private Long productSku;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "tax_amount", nullable = false)
    private Double taxAmount;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "row_total", nullable = false)
    private Double rowTotal;

    @Column(name = "taxable_amount")
    private Double taxableAmount;

    @Column(name = "cgst_rate")
    private Double cgstRate;

    @Column(name = "cgst_amount")
    private Double cgstAmount;

    @Column(name = "sgst_rate")
    private Double sgstRate;

    @Column(name = "sgst_amount")
    private Double sgstAmount;

    @Column(name = "igst_rate")
    private Double igstRate;

    @Column(name = "igst_amount")
    private Double igstAmount;

    @Column(name = "cess_rate")
    private Double cessRate;

    @Column(name = "cess_amount")
    private Double cessAmount;

    @Column(name = "total_tax")
    private Double totalTax;

    @Column(name = "total_amount")
    private Double totalAmount;

}