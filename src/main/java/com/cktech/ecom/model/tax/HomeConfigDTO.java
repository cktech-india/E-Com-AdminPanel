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

@Data
@Entity
@Table(name = "home_config_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class HomeConfigDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", length = 5)
    private String companyCode;

    @Column(name = "config_type", length = 50)
    private String configType;

    @Column(name = "config_title")
    private String configTitle;

    @Column(name = "config_value")
    private String configValue;

    @Column(name = "config_properties", columnDefinition = "TEXT")
    private String configProperties;

    @Column(name = "sequence_no")
    private Integer sequenceNo;
}