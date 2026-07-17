package com.cktech.ecom.model.company;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "company_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDTO extends Auditable {

    @Id
    @Column(name = "company_code", nullable = false, length = 5)
    private String companyCode;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "domain_url", nullable = false, length = 255)
    private String domainUrl;

    @Column(name = "gst_state_code", nullable = false, length = 50)
    private String gstStateCode;

    @Column(name = "gst_no", nullable = false, length = 100)
    private String gstNo;

    @Column(name = "company_address", nullable = false, columnDefinition = "TEXT")
    private String companyAddress;
}