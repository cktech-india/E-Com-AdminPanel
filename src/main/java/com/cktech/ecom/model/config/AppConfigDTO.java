package com.cktech.ecom.model.config;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "app_config_t",uniqueConstraints = {
        @UniqueConstraint(name = "uni_app_config_t_company_config", columnNames = {"company_code","config_code","config_group"}),
})
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class AppConfigDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 50)
    private String companyCode;

    @Column(name = "config_code", nullable = false, length = 50)
    private String configCode;

    @Column(name = "config_name", length = 150)
    private String configName;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "config_group", length = 50)
    private String configGroup;

    @Column(name = "control_type", length = 50)
    private String controlType;
}
