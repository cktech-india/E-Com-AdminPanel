package com.cktech.ecom.model.company;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "company_t",uniqueConstraints = {
        @UniqueConstraint(name = "uni_company_t", columnNames = {"company_code","company_name"}),
})
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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