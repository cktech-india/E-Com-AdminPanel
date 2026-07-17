package com.cktech.ecom.model.country;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "country_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class CountryDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "country_id")
    private Long countryId;

    @Column(name = "company_code", length = 50)
    private String companyCode;

    @Column(name = "country_name", length = 50)
    private String countryName;
}
