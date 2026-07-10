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
@Table(name = "tax_rates_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class TaxRateDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tax_category_id", nullable = false)
    private Long taxCategoryId;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(name = "state_code", length = 10)
    private String stateCode;

    @Column(name = "tax_name", nullable = false, length = 50)
    private String taxName;

    @Column(name = "tax_percentage", nullable = false, precision = 5, scale = 3)
    private BigDecimal taxPercentage;

    @Column(name = "priority")
    private Integer priority = 1;
}