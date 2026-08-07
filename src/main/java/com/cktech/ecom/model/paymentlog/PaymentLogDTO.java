package com.cktech.ecom.model.paymentlog;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_logs_t")
@AllArgsConstructor
@NoArgsConstructor
public class PaymentLogDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", length = 50, nullable = false)
    private String companyCode;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_number", length = 50)
    private String orderNumber;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "payment_gateway", length = 50, nullable = false)
    private String paymentGateway;

    @Column(name = "gateway_order_id", length = 100)
    private String gatewayOrderId;

    @Column(name = "gateway_payment_id", length = 100)
    private String gatewayPaymentId;

    @Column(name = "payment_status", length = 50, nullable = false)
    private String paymentStatus;

    @Column(name = "payment_amount", precision = 10, scale = 2)
    private BigDecimal paymentAmount;

    @Column(name = "payment_currency", length = 10)
    private String paymentCurrency = "INR";

    @Column(name = "gateway_api_response", columnDefinition = "TEXT")
    private String gatewayApiResponse;

    @Column(name = "attempt_number")
    private Integer attemptNumber = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
