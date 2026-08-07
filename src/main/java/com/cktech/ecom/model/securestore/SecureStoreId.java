package com.cktech.ecom.model.securestore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecureStoreId implements Serializable {
    private String companyCode;
    private String configCode;
}
