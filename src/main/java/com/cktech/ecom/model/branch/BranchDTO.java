package com.cktech.ecom.model.branch;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "branches_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class BranchDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 5)
    private String companyCode;

    @Column(name = "branch_name", nullable = false, length = 100)
    private String branchName;

    @Column(length = 50)
    private String city;

    @Column
    private String address;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
}