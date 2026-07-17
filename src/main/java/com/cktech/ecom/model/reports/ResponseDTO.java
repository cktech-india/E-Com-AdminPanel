package com.cktech.ecom.model.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO {
    private String status;
    private String message;

    public static final ResponseDTO SUCCESS = new ResponseDTO("SUCCESS", "Operation completed successfully");
}
