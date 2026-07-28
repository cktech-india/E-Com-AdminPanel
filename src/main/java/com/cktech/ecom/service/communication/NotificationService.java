package com.cktech.ecom.service.communication;

import com.cktech.ecom.common.AppEnum;
import com.cktech.ecom.model.dto.SendSMSDTO;
import com.cktech.ecom.model.dto.MailDTO;
import com.cktech.ecom.model.dto.ValidationMessages;
import com.cktech.ecom.model.notification.NotificationLogDTO;
import com.cktech.ecom.model.notification.NotificationTemplateDTO;
import com.cktech.ecom.model.notification.NotificationTemplateId;
import com.cktech.ecom.model.reports.ResponseDTO;
import com.cktech.ecom.repository.common.NotificationLogRepository;
import com.cktech.ecom.repository.common.NotificationTemplateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

/**
 * The type Notification service.
 */
@Service
public class NotificationService {
    private static final Logger LOG = LoggerFactory.getLogger(NotificationService.class);
    private final ObjectMapper objectMapper;
    private final EmailService mailService;
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final NotificationLogRepository notificationLogRepository;

    @Value("${sms.msg91.endpoint:}")
    private String msg91Endpoint;
    @Value("${sms.msg91.key:}")
    private String msg91Key;
    @Value("${sms.mydreamtech.endpoint:}")
    private String mydreamtechEndpoint;
    @Value("${sms.mydreamtech.key:}")
    private String myDreamTechKey;

    @Value("${whatsapp.msg91.endpoint:}")
    private String whatsappMsg91Endpoint;
    @Value("${whatsapp.msg91.key:}")
    private String whatsappMsg91Key;
    @Value("${whatsapp.msg91.number:}")
    private String whatsappMsg91Number;

    /**
     * The Executor.
     */
    ExecutorService executor = Executors.newFixedThreadPool(10);

    public NotificationService(
            final ObjectMapper objectMapper,
            final EmailService mailServiceIn,
            final NotificationTemplateRepository notificationTemplateRepository,
            final NotificationLogRepository notificationLogRepository) {
        this.objectMapper = objectMapper;
        this.mailService = mailServiceIn;
        this.notificationTemplateRepository = notificationTemplateRepository;
        this.notificationLogRepository = notificationLogRepository;
    }

    private void saveLog(SendSMSDTO info) {
        try {
            NotificationLogDTO log = new NotificationLogDTO();
            log.setNotificationCode(info.getNotificationCode());
            if (info.getNotificationType() != null) {
                try {
                    log.setChannelType(AppEnum.ChannelType.valueOf(info.getNotificationType()));
                } catch (Exception e) {
                    LOG.warn("Unknown channel type: {}", info.getNotificationType());
                }
            }
            log.setSubject(info.getSubject());
            log.setContent(info.getMessageContent());
            log.setRecipient(info.getSendToMobiles());
            log.setStatus(info.getStatus());
            log.setSentAt(LocalDateTime.now());
            log.setMessage(info.getResponse());
            log.setCreatedBy(info.getCreatedBy() != null ? info.getCreatedBy() : "SYSTEM");
            notificationLogRepository.save(log);
        } catch (Exception e) {
            LOG.error("Failed to save notification log via repository", e);
        }
    }

    public ResponseDTO sendEmail(SendSMSDTO emailInfo, Map<String, Object> contentParams, String actionBy, String companyCode) {
        var result = new ResponseDTO("ERROR");
        try {
            if (emailInfo.getAppliedCredit() == null || emailInfo.getAppliedCredit() <= 0) {
                result.setMessage("Email Credit is not defined on the template.");
                emailInfo.setStatus("F");
                return result;
            }

            var emailList = new ArrayList<String>();
            if (contentParams.get("emailTo") != null) {
                for (String email : contentParams.get("emailTo").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        emailList.add(email.trim());
                    }
                }
            } else if (contentParams.get("email") != null) {
                for (String email : contentParams.get("email").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        emailList.add(email.trim());
                    }
                }
            }
            Map<String, Object> systemParams = new HashMap<>();
            if (emailInfo.getSystemParams() != null && !emailInfo.getSystemParams().trim().isEmpty()) {
                systemParams = objectMapper.readValue(emailInfo.getSystemParams(), Map.class);
                if (systemParams.get("email") != null) {
                    for (String email : systemParams.get("email").toString().split(",")) {
                        if (email != null && !email.trim().isEmpty()) {
                            emailList.add(email.trim());
                        }
                    }
                }
            }
            if (emailInfo.getSmsParam() != null && emailInfo.getSmsParam().get("emailTo") != null) {
                for (String email : emailInfo.getSmsParam().get("emailTo").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        emailList.add(email.trim());
                    }
                }
            }

            var ccList = new ArrayList<String>();
            if (contentParams.get("emailCc") != null) {
                for (String email : contentParams.get("emailCc").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        ccList.add(email.trim());
                    }
                }
            } else if (contentParams.get("cc") != null) {
                for (String email : contentParams.get("cc").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        ccList.add(email.trim());
                    }
                }
            }
            if (emailInfo.getSmsParam() != null && emailInfo.getSmsParam().get("emailCc") != null) {
                for (String email : emailInfo.getSmsParam().get("emailCc").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        ccList.add(email.trim());
                    }
                }
            }

            var bccList = new ArrayList<String>();
            if (contentParams.get("emailBcc") != null) {
                for (String email : contentParams.get("emailBcc").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        bccList.add(email.trim());
                    }
                }
            } else if (contentParams.get("bcc") != null) {
                for (String email : contentParams.get("bcc").toString().split(",")) {
                    if (email != null && !email.trim().isEmpty()) {
                        bccList.add(email.trim());
                    }
                }
            }

            int templateCredit = emailInfo.getAppliedCredit();
            int totalRecipients = emailList.isEmpty() ? 0 : (emailList.size() + ccList.size() + bccList.size());
            int totalCredits = totalRecipients * templateCredit;

            emailInfo.setAppliedCredit(totalCredits);

            int balance = emailInfo.getAvailableCredit() != null ? emailInfo.getAvailableCredit() : 0;
            if (balance >= totalCredits) {
                if (!emailList.isEmpty()) {
                    if (emailInfo.getDefaultInput() != null && !emailInfo.getDefaultInput().isBlank()) {
                        var defaultParams = objectMapper.readValue(emailInfo.getDefaultInput(), Map.class);
                        for (var key : defaultParams.keySet()) {
                            if (!contentParams.containsKey(key.toString())) {
                                contentParams.put(key.toString(), defaultParams.get(key));
                            }
                        }
                    }

                    String subject = emailInfo.getSubject();
                    if (subject != null) {
                        for (String key : contentParams.keySet()) {
                            if (contentParams.get(key) != null) {
                                subject = subject.replace("{#" + key + "#}", contentParams.get(key).toString());
                            }
                        }
                        subject = mailService.processTemplate(subject, contentParams);
                        emailInfo.setSubject(subject);
                    }

                    String msgContent = emailInfo.getMessageContent();
                    if (msgContent != null) {
                        for (String key : contentParams.keySet()) {
                            if (contentParams.get(key) != null) {
                                msgContent = msgContent.replace("{#" + key + "#}", contentParams.get(key).toString());
                            }
                        }
                        msgContent = mailService.processTemplate(msgContent, contentParams);
                        emailInfo.setMessageContent(msgContent);
                    }

                    emailInfo.setCompanyCode(companyCode);
                    emailInfo.setContentParams(contentParams);
                    emailInfo.setCreatedBy(actionBy);
                    emailInfo.setSendToMobiles(String.join(",", emailList));

                    var mailBuilder = MailDTO.builder()
                            .to(emailList.toArray(String[]::new))
                            .templateParams(contentParams)
                            .subject(emailInfo.getSubject())
                            .messageOrTemplate(emailInfo.getMessageContent());

                    if (!ccList.isEmpty()) {
                        mailBuilder.cc(ccList.toArray(String[]::new));
                    }
                    if (!bccList.isEmpty()) {
                        mailBuilder.bcc(bccList.toArray(String[]::new));
                    }

                    boolean hasAttachment = false;
                    if (systemParams.containsKey("hasAttachment")) {
                        Object val = systemParams.get("hasAttachment");
                        if (val instanceof Boolean) {
                            hasAttachment = (Boolean) val;
                        } else if (val != null) {
                            hasAttachment = Boolean.parseBoolean(val.toString());
                        }
                    }

                    if (hasAttachment) {
                        String filename = null;
                        if (contentParams.containsKey("fileName")) {
                            filename = String.valueOf(contentParams.get("fileName"));
                        } else if (systemParams.containsKey("filename")) {
                            filename = String.valueOf(systemParams.get("filename"));
                        } else {
                            filename = "document.pdf";
                        }

                        String attachmentUrl = null;
                        if (contentParams.containsKey("fileUrl")) {
                            attachmentUrl = String.valueOf(contentParams.get("fileUrl"));
                        } else if (emailInfo.getFileUrl() != null && !emailInfo.getFileUrl().isEmpty()) {
                            attachmentUrl = emailInfo.getFileUrl();
                        }

                        if (attachmentUrl != null && !attachmentUrl.isBlank()) {
                            mailBuilder.attachmentLocations(List.of(filename + "|" + attachmentUrl));
                        }
                    }

                    var msg = mailService.sendEmail(mailBuilder.build());
                    if (msg.equalsIgnoreCase("S")) {
                        emailInfo.setStatus("D");
                        emailInfo.setResponse("Email sent successfully!");
                        result = new ResponseDTO("SUCCESS", "Email sent successfully!!!");
                    } else {
                        emailInfo.setStatus("F");
                        emailInfo.setResponse("Email sent failed!" + msg);
                        result.setMessage("Email sent failed!" + msg);
                    }

                } else {
                    emailInfo.setStatus("F");
                    emailInfo.setResponse("Email list is empty");
                    result = ValidationMessages.UNABLE_TO_SEND_NOTIFY;
                    result.setMessage("Email list is empty");
                }
            } else {
                result.setMessage("Email balance is not sufficient!!!");
                emailInfo.setStatus("B");
                emailInfo.setResponse("Email balance is not sufficient!!!");
            }
        } catch (Exception e) {
            LOG.error("Error while sending email alert", e);
            result.setMessage(e.getMessage());
            result.setOtherMessage(List.of(e));
            if (emailInfo != null) {
                emailInfo.setStatus("F");
                emailInfo.setResponse(e.getMessage());
            }
        } finally {
            if (emailInfo != null) {
                saveLog(emailInfo);
            }
        }
        return result;
    }

    public List<ResponseDTO> sendNotification(Map<String, Object> contentParams, String smsCode, String actionBy,
                                              String companyCode, String notifyChannel) {
        var resultSet = new ArrayList<ResponseDTO>();
        List<NotificationTemplateDTO> templates = notificationTemplateRepository.findByNotificationCodeAndIsActiveTrue(smsCode);

        List<SendSMSDTO> smsList = new ArrayList<>();
        for (NotificationTemplateDTO template : templates) {
            SendSMSDTO dto = new SendSMSDTO();
            dto.setNotificationCode(template.getNotificationCode());
            dto.setNotificationType(template.getChannelType() != null ? template.getChannelType().name() : "");
            dto.setSubject(template.getSubject());
            dto.setMessageContent(template.getContent());
            dto.setDefaultInput(template.getDefaultInput());
            dto.setSystemParams(template.getDefaultInput() != null ? template.getDefaultInput() : "{}");
            dto.setAppliedCredit(1); // Bypass/Default for Sinjay Mart (no credit restrictions)
            dto.setAvailableCredit(100);
            dto.setCompanyCode(companyCode);
            smsList.add(dto);
        }

        // When particular notification is defined then send to that alone.
        if (notifyChannel != null && !notifyChannel.isBlank()) {
            smsList = smsList.stream().filter(e -> e.getNotificationType().equalsIgnoreCase(notifyChannel)).toList();
        }
        if (smsList.isEmpty()) {
            return List.of(ValidationMessages.UNABLE_TO_SEND_NOTIFY);
        }

        for (var sms : smsList) {
            ResponseDTO result;
            if (sms.getNotificationType().equals("EMAIL")) {
                result = sendEmail(sms, contentParams, actionBy, companyCode);
            } else if (sms.getNotificationType().equals("WHATSAPP")) {
                result = sendWhatsApp(sms, contentParams, actionBy, companyCode);
            } else {
                result = sendSMS(sms, contentParams, actionBy, companyCode);
            }
            resultSet.add(result);
        }
        return resultSet;
    }

    public ResponseDTO sendSMS(SendSMSDTO smsInfo, Map<String, Object> contentParams, String actionBy, String companyCode) {
        var result = new ResponseDTO("ERROR");
        try {
            if (smsInfo.getAppliedCredit() == null || smsInfo.getAppliedCredit() <= 0) {
                result.setMessage("SMS Credit is not defined on the template.");
                smsInfo.setStatus("F");
                return result;
            }
            int balance = smsInfo.getAvailableCredit() != null ? smsInfo.getAvailableCredit() : 0;
            if (balance >= smsInfo.getAppliedCredit()) {
                smsInfo.setCompanyCode(companyCode);
                smsInfo.setContentParams(contentParams);
                smsInfo.setCreatedBy(actionBy);
                Map<String, Object> data = smsInfo.getContentParams();
                String msgContent = smsInfo.getMessageContent();
                var defaultParams = new HashMap<>();
                if (smsInfo.getDefaultInput() != null && !smsInfo.getDefaultInput().isBlank()) {
                    defaultParams = objectMapper.readValue(smsInfo.getDefaultInput(), HashMap.class);
                }
                HashMap<String, Object> systemParamsTemp = new HashMap<>();
                if (smsInfo.getSystemParams() != null && !smsInfo.getSystemParams().isBlank()) {
                    systemParamsTemp = objectMapper.readValue(smsInfo.getSystemParams(), HashMap.class);
                }
                final HashMap<String, Object> systemParams = systemParamsTemp;
                for (var key : defaultParams.keySet()) {
                    if (!contentParams.containsKey(key.toString())) {
                        contentParams.put(key.toString(), defaultParams.get(key));
                    }
                }
                // Never move this bcoz it is required to show sms calculation based on message length
                for (String key : data.keySet()) {
                    if (data.get(key) != null) {
                        msgContent = msgContent.replace("{#" + key + "#}", data.get(key).toString());
                    }
                }

                smsInfo.setSendToMobiles(data.getOrDefault("mobile", "").toString());
                smsInfo.setMessageContent(msgContent);
                if (!isValidIndianMobile(smsInfo.getSendToMobiles())) {
                    LOG.info("Mobile No is not valid - {}!!!", smsInfo.getSendToMobiles());
                    result.setMessage("No mobile is not valid!!!");
                    return result;
                }

                var isSmsSend = false;
                var tempUrl = "";
                var responseStr = "";
                if ("MSG91".equals(systemParams.getOrDefault("provider", ""))) {
                    var params = new HashMap<String, Object>();
                    params.putAll(smsInfo.getContentParams());
                    var mobile = smsInfo.getSendToMobiles();
                    if (mobile.length() <= 10) {
                        mobile = "91" + mobile;
                    }
                    params.put("mobiles", mobile);
                    // Construct the body according to MSG91 Flow API
                    Map<String, Object> body = Map.of(
                            "template_id", systemParams.getOrDefault("templateId", ""),
                            "short_url", "0",
                            "recipients", List.of(params));
                    var response = RestClient.builder().baseUrl(msg91Endpoint).build().post()
                            .uri("/flow/")
                            .header("authkey", msg91Key)
                            .header("Content-Type", "application/json")
                            .body(body)
                            .retrieve()
                            .toEntity(Map.class).getBody();
                    if (response != null) {
                        isSmsSend = "success".equals(response.getOrDefault("type", ""));
                        responseStr = response.toString();
                    }
                } else {
                    tempUrl = mydreamtechEndpoint + "?apikey=" + myDreamTechKey + "&senderid=" + smsInfo.getSenderId()
                            + "&templateid=" + systemParams.getOrDefault("templateId", "") + "&number=" + smsInfo.getSendToMobiles() + "&message="
                            + smsInfo.getMessageContent();
                    responseStr = RestClient.builder().baseUrl(mydreamtechEndpoint).build().get()
                            .uri(uriBuilder -> uriBuilder
                                    .queryParam("apikey", myDreamTechKey)
                                    .queryParam("senderid", smsInfo.getSenderId())
                                    .queryParam("templateid", systemParams.getOrDefault("templateId", ""))
                                    .queryParam("number", smsInfo.getSendToMobiles())
                                    .queryParam("message", smsInfo.getMessageContent())
                                    .build())
                            .retrieve()
                            .toEntity(String.class).getBody();
                    LOG.info(responseStr);
                    if (responseStr != null) {
                        var parsedResponse = objectMapper.readValue(responseStr, Map.class);
                        isSmsSend = "Success".equals(parsedResponse.getOrDefault("status", ""));
                    }
                }
                LOG.info(tempUrl);
                if (isSmsSend) {
                    smsInfo.setStatus("D");
                    result = new ResponseDTO("SUCCESS", "SMS sent successfully!!!");
                } else {
                    result.setMessage(responseStr);
                    smsInfo.setStatus("F");
                }
                smsInfo.setResponse(responseStr);
            } else {
                result.setMessage("SMS balance is not sufficient!!!");
                smsInfo.setStatus("B");
            }
        } catch (Exception e) {
            result.setMessage(e.getMessage());
            result.setOtherMessage(List.of(e));
            LOG.error("Error", e);
            assert smsInfo != null;
            smsInfo.setStatus("F");
        } finally {
            if (smsInfo != null) {
                saveLog(smsInfo);
            }
        }
        return result;
    }

    public ResponseDTO sendWhatsApp(SendSMSDTO smsInfo, Map<String, Object> contentParams, String actionBy, String companyCode) {
        var result = new ResponseDTO("ERROR");
        try {
            if (smsInfo.getAppliedCredit() == null || smsInfo.getAppliedCredit() <= 0) {
                result.setMessage("WhatsApp Credit is not defined on the template.");
                smsInfo.setStatus("F");
                return result;
            }
            int balance = smsInfo.getAvailableCredit() != null ? smsInfo.getAvailableCredit() : 0;
            if (balance >= smsInfo.getAppliedCredit()) {
                smsInfo.setCompanyCode(companyCode);
                smsInfo.setContentParams(contentParams);
                smsInfo.setCreatedBy(actionBy);
                Map<String, Object> data = smsInfo.getContentParams();
                String msgContent = smsInfo.getMessageContent();
                var defaultParams = new HashMap<>();
                if (smsInfo.getDefaultInput() != null && !smsInfo.getDefaultInput().isBlank()) {
                    defaultParams = objectMapper.readValue(smsInfo.getDefaultInput(), HashMap.class);
                }
                for (var key : defaultParams.keySet()) {
                    if (!contentParams.containsKey(key.toString())) {
                        contentParams.put(key.toString(), defaultParams.get(key));
                    }
                }
                for (String key : data.keySet()) {
                    if (data.get(key) != null) {
                        msgContent = msgContent.replace("{#" + key + "#}", data.get(key).toString());
                    }
                }

                String whatsappNumber = null;
                if (data.containsKey("whatsappNumber") && data.get("whatsappNumber") != null && !data.get("whatsappNumber").toString().isBlank()) {
                    whatsappNumber = data.get("whatsappNumber").toString();
                }else if (data.containsKey("moble") && data.get("mobile") != null && !data.get("mobile").toString().isBlank()) {
                    whatsappNumber = data.get("mobile").toString();
                }

                if (whatsappNumber == null || whatsappNumber.isBlank()) {
                    result.setMessage("WhatsApp number is not provided.");
                    smsInfo.setStatus("F");
                    return result;
                }

                smsInfo.setSendToMobiles(whatsappNumber);
                smsInfo.setMessageContent(msgContent);

                var mobile = smsInfo.getSendToMobiles();
                List<String> recipients = new ArrayList<>();
                if (mobile != null) {
                    for (String num : mobile.split(",")) {
                        num = num.trim();
                        if (!num.isEmpty()) {
                            if (num.length() <= 10) {
                                num = "91" + num;
                            }
                            recipients.add(num);
                        }
                    }
                }

                Map<String, Object> systemParams = new HashMap<>();
                if (smsInfo.getSystemParams() != null && !smsInfo.getSystemParams().trim().isEmpty()) {
                    systemParams = objectMapper.readValue(smsInfo.getSystemParams(), Map.class);
                }

                String templateName = null;
                if (systemParams.containsKey("templateId")) {
                    templateName = String.valueOf(systemParams.get("templateId"));
                }

                String langCode = "en";
                if (systemParams.containsKey("languageCode")) {
                    langCode = String.valueOf(systemParams.get("languageCode"));
                }
                Map<String, Object> components = new HashMap<>();

                boolean hasAttachment = false;
                if (systemParams.containsKey("hasAttachment")) {
                    Object val = systemParams.get("hasAttachment");
                    if (val instanceof Boolean) {
                        hasAttachment = (Boolean) val;
                    } else if (val != null) {
                        hasAttachment = Boolean.parseBoolean(val.toString());
                    }
                }

                if (hasAttachment) {
                    String attachmentType = String.valueOf(systemParams.getOrDefault("attachmentType", "document"));
                    String filename = null;
                    if (contentParams.containsKey("fileName")) {
                        filename = String.valueOf(contentParams.get("fileName"));
                    } else if (systemParams.containsKey("filename")) {
                        filename = String.valueOf(systemParams.get("filename"));
                    } else {
                        filename = "document.pdf";
                    }

                    String attachmentUrl = null;
                    if (contentParams.containsKey("fileUrl")) {
                        attachmentUrl = String.valueOf(contentParams.get("fileUrl"));
                    } else if (smsInfo.getFileUrl() != null && !smsInfo.getFileUrl().isEmpty()) {
                        attachmentUrl = smsInfo.getFileUrl();
                    }

                    Map<String, String> headerMap = new HashMap<>();
                    headerMap.put("type", attachmentType);
                    headerMap.put("filename", filename);
                    headerMap.put("value", attachmentUrl != null ? attachmentUrl : "");
                    components.put("header_1", headerMap);
                }

                List<String> bodySequence = (List<String>) systemParams.get("bodySequence");
                if (bodySequence != null) {
                    for (int i = 0; i < bodySequence.size(); i++) {
                        String key = bodySequence.get(i);
                        Object value = contentParams.get(key);
                        String stringValue = (value != null) ? value.toString() : "";
                        components.put("body_" + (i + 1), Map.of("type", "text", "value", stringValue));
                    }
                }

                Map<String, Object> language = Map.of(
                        "code", langCode,
                        "policy", "deterministic"
                );

                Map<String, Object> toAndComponentItem = Map.of(
                        "to", recipients,
                        "components", components
                );

                Map<String, Object> template = Map.of(
                        "name", templateName != null ? templateName : "",
                        "language", language,
                        "to_and_components", List.of(toAndComponentItem)
                );

                Map<String, Object> payload = Map.of(
                        "type", "template",
                        "template", template,
                        "messaging_product", "whatsapp"
                );

                Map<String, Object> body = Map.of(
                        "integrated_number", systemParams.getOrDefault("whatsAppNumber", whatsappMsg91Number != null ? whatsappMsg91Number : ""),
                        "content_type", "template",
                        "payload", payload
                );

                LOG.info("Sending WhatsApp message to {}: {}", mobile, msgContent);

                var response = RestClient.builder().baseUrl(whatsappMsg91Endpoint).build().post()
                        .header("authkey", whatsappMsg91Key)
                        .header("Content-Type", "application/json")
                        .body(body)
                        .retrieve()
                        .toEntity(Map.class).getBody();
                String apiResponse = objectMapper.writeValueAsString(response);
                LOG.info("WhatsApp Body: {}", apiResponse);
                LOG.info("WhatsApp API response: {}", response);

                boolean isWhatsappSent = false;
                if (response != null) {
                    smsInfo.setResponse(apiResponse);
                    var status = response.getOrDefault("status", "");
                    var type = response.getOrDefault("type", "");
                    isWhatsappSent = "success".equalsIgnoreCase(status.toString()) || "success".equalsIgnoreCase(type.toString());
                }

                if (isWhatsappSent) {
                    smsInfo.setStatus("D");
                    result = new ResponseDTO("SUCCESS", "WhatsApp sent successfully!!!");
                } else {
                    if (apiResponse != null && !apiResponse.isEmpty()) {
                        result.setMessage(apiResponse);
                    } else {
                        result.setMessage("Server Error, Contact Admin!!!");
                    }
                    smsInfo.setStatus("F");
                }
                smsInfo.setResponse(response != null ? response.toString() : "No response");
            } else {
                result.setMessage("SMS/WhatsApp balance is not sufficient!!!");
                smsInfo.setStatus("B");
            }
        } catch (Exception e) {
            result.setMessage(e.getMessage());
            result.setOtherMessage(List.of(e));
            try {
                smsInfo.setResponse(objectMapper.writeValueAsString(Map.of("error", e.getLocalizedMessage())));
            } catch (Exception ex) {
                LOG.error(ex.getMessage(), ex);
            }
            LOG.error("Error sending WhatsApp", e);
            assert smsInfo != null;
            smsInfo.setStatus("F");
        } finally {
            if (smsInfo != null) {
                saveLog(smsInfo);
            }
        }
        return result;
    }

    private Runnable addNotificationTask(Map<String, Object> contentParams, String smsCode, String actionBy, String
            companyCode, String notifyChannel) {
        return () -> sendNotification(contentParams, smsCode, actionBy, companyCode, notifyChannel);
    }

    public boolean isValidIndianMobile(String mobile) {
        if (mobile == null || mobile.isEmpty()) {
            return false;
        }
        return Pattern.compile("^(?:(?:\\+|0{0,2})91[\\s-]?)?[6789]\\d{9}$").matcher(mobile).matches();
    }

    public ResponseDTO trigger(final Map<String, Object> input, final String notificationCode,
                               final String actionBy, String companyCode, String notifyChannel) {
        var results = sendNotification(input, notificationCode, actionBy, companyCode, notifyChannel);
        if (results.isEmpty()) {
            return ValidationMessages.UNABLE_TO_SEND_NOTIFY;
        }
        boolean hasFailure = results.stream().anyMatch(r -> !"SUCCESS".equalsIgnoreCase(r.getStatus()));
        if (hasFailure) {
            String combinedMsg = results.stream()
                    .map(r -> r.getMessage() != null ? r.getMessage().toString() : "")
                    .filter(msg -> !msg.isBlank())
                    .collect(java.util.stream.Collectors.joining(" | "));
            return new ResponseDTO("ERROR", combinedMsg.isBlank() ? "Some notifications failed" : combinedMsg);
        }
        return results.get(0);
    }

    public List<NotificationTemplateDTO> getTemplates() {
        return notificationTemplateRepository.findByIsDeletedFalse();
    }

    public List<NotificationLogDTO> getLogs() {
        List<NotificationLogDTO> logs = new ArrayList<>();
        notificationLogRepository.findByIsDeletedFalse().forEach(logs::add);
        logs.sort((a, b) -> b.getId().compareTo(a.getId()));
        return logs;
    }

    @Transactional
    public ResponseDTO saveTemplate(NotificationTemplateDTO template) {
        if (template.getNotifyChannel() != null) {
            try {
                template.setChannelType(AppEnum.ChannelType.valueOf(template.getNotifyChannel().toUpperCase()));
            } catch (Exception e) {
                LOG.error("Invalid channel type: {}", template.getNotifyChannel());
            }
        }
        if (template.getMessageContent() != null) {
            template.setContent(template.getMessageContent());
        }
        if (template.getDefaultInputs() != null) {
            template.setDefaultInput(template.getDefaultInputs());
        }
        if (template.getIsDeleted() == null) {
            template.setIsDeleted(false);
        }
        if (template.getIsActive() == null) {
            template.setIsActive(true);
        }
        notificationTemplateRepository.save(template);
        return new ResponseDTO("SUCCESS", "Template saved successfully");
    }

    @Transactional
    public ResponseDTO deleteTemplate(String notificationCode, String notifyChannel) {
        try {
            AppEnum.ChannelType channelType = AppEnum.ChannelType.valueOf(notifyChannel.toUpperCase());
            NotificationTemplateId id = new NotificationTemplateId(notificationCode, channelType);
            notificationTemplateRepository.deleteById(id);
            return new ResponseDTO("SUCCESS", "Template deleted successfully");
        } catch (Exception e) {
            return new ResponseDTO("ERROR", "Failed to delete template: " + e.getMessage());
        }
    }
}
