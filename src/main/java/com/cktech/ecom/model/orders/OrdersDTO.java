package com.cktech.ecom.model.orders;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "orders_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class OrdersDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_code", length = 50)
    private String companyCode;

    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    @Column(name = "status")
    private String status;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxTotal;

    @Column(name = "shipping_charges", precision = 10, scale = 2)
    private BigDecimal shippingCharges;

    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "shipping_address_id")
    private Long shippingAddressId;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "tax_name", length = 50)
    private String taxName;

    @Column(name = "tax_rate_applied", precision = 5, scale = 3)
    private BigDecimal taxRateApplied;

    @Column(name = "tax_amount_calculated", precision = 15, scale = 2)
    private BigDecimal taxAmountCalculated;

    @Column(name = "tax_type")
    private String taxType;

    @Column(name = "total_cgst", precision = 10, scale = 2)
    private BigDecimal totalCgst;

    @Column(name = "total_sgst", precision = 10, scale = 2)
    private BigDecimal totalSgst;

    @Column(name = "total_igst", precision = 10, scale = 2)
    private BigDecimal totalIgst;

    @Column(name = "total_cess", precision = 10, scale = 2)
    private BigDecimal totalCess;
}