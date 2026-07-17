package com.cktech.ecom.model.stocklog;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stock_logs_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class StockLogDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "change_amount", nullable = false)
    private Integer changeAmount;

    @Column(nullable = false)
    private com.cktech.ecom.common.AppEnum.STOCK_LOG_REASON reason;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}