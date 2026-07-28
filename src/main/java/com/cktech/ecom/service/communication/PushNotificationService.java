package com.cktech.ecom.service.communication;

import com.cktech.ecom.model.reports.ResponseDTO;
import com.cktech.ecom.model.notification.NotificationLogDTO;
import com.cktech.ecom.model.notification.NotificationTemplateDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class PushNotificationService {
    private static final Logger LOG = LoggerFactory.getLogger(PushNotificationService.class);
    private final ObjectMapper objectMapper;
    /**
     * The Executor.
     */
    ExecutorService executor = Executors.newFixedThreadPool(10);

    private final RestTemplate restTemplate;

    @Value("${sms.url:}")
    String smsUrl;

    public PushNotificationService(final RestTemplate restTemplateIn, ObjectMapper objectMapper) {
        this.restTemplate = restTemplateIn;
        this.objectMapper = objectMapper;
    }

    // ToDo: Implement the send push notification logic here.
    public ResponseDTO send(NotificationLogDTO notification, NotificationTemplateDTO template) {
        return new ResponseDTO("SUCCESS", "Push simulated successfully");
    }
}
