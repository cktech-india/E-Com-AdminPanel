package com.cktech.ecom.model.dto;

import com.cktech.ecom.common.AppEnum;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@Data
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    @JsonIgnore
    private String createdBy;

    @CreatedDate
    @Column(name = "created_date", updatable = false)
    @JsonIgnore
    private LocalDateTime createdDate;

    @LastModifiedBy
    @Column(name = "last_modified_by")
    @JsonIgnore
    private String modifiedBy;

    @LastModifiedDate
    @Column(name = "last_modified_date")
    @JsonIgnore
    private LocalDateTime modifiedDate;

    @Column(name = "is_active", columnDefinition = "BIT(1) DEFAULT b'1'")
    private Boolean isActive = true;
    @Column(name = "is_deleted", columnDefinition = "BIT(1) DEFAULT b'0'")
    @JsonIgnore
    private Boolean isDeleted = false;

    @Transient
    AppEnum.RecordMode recordMode;

    @Transient
    private String currentUser; // This will not be a column in the DB
}

