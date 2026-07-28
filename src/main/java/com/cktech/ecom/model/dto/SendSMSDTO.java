package com.cktech.ecom.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class SendSMSDTO {

    private String companyCode;
    private String notificationCode;
    private String notificationType;
    private String branchCode;
    private String sendToMobiles;
    private Map<String, Object> contentParams;
    private Map<String, Object> smsParam;
    private String subject;
    private String messageContent;
    private String createdBy;
    private String status;
    private String defaultInput;
    private String systemParams;
    private Integer appliedCredit;
    private String senderId;
    private String fileUrl;
    private Integer availableCredit;
    private String response;

}
