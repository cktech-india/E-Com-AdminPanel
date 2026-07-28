package com.cktech.ecom.model.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO {
    private String status;
    private Object message;
    private List<Object> otherMessage;

    public ResponseDTO(String status) {
        this.status = status;
    }

    public ResponseDTO(String status, Object message) {
        this.status = status;
        this.message = message;
    }
}
