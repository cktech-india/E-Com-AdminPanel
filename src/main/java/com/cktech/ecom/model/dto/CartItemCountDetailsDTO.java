package com.cktech.ecom.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class CartItemCountDetailsDTO {
    private Long productId;
    private String productCode;
    private String productName;
    private Long totalUsers;
    private Long totalQuantity;
    private Long wishlist;
}
