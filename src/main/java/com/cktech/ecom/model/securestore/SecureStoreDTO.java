package com.cktech.ecom.model.securestore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "secure_store_t")
@IdClass(SecureStoreId.class)
@AllArgsConstructor
@NoArgsConstructor
public class SecureStoreDTO {

    @Id
    @Column(name = "company_code", length = 50, nullable = false)
    private String companyCode;

    @Id
    @Column(name = "config_code", length = 100, nullable = false)
    private String configCode;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "group_name", length = 100)
    private String groupName;

    @Column(name = "group_type", length = 100)
    private String groupType;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    @UpdateTimestamp
    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;
}
