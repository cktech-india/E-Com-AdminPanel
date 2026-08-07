package com.cktech.ecom.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class CashfreeService {

    private final SecureStoreService secureStoreService;
    private final RestTemplate restTemplate;

    public CashfreeService(SecureStoreService secureStoreService) {
        this.secureStoreService = secureStoreService;
        this.restTemplate = new RestTemplate();
    }

    private String getBaseUrl(String companyCode) {
        String env = secureStoreService.getConfigValueDecrypted(companyCode, "CASHFREE_ENV");
        if ("PRODUCTION".equalsIgnoreCase(env)) {
            return "https://api.cashfree.com/pg";
        }
        return "https://sandbox.cashfree.com/pg";
    }

    public Map<String, Object> createOrder(String companyCode, String orderId, double amount, String customerId, String customerName, String mobile, String email, String returnUrl) {
        String appId = secureStoreService.getConfigValueDecrypted(companyCode, "CASHFREE_APP_ID");
        String secret = secureStoreService.getConfigValueDecrypted(companyCode, "CASHFREE_SECRET");

        if (appId == null || secret == null) {
            throw new RuntimeException("Cashfree payment gateway credentials are not configured in Secure Store.");
        }

        String url = getBaseUrl(companyCode) + "/orders";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", appId);
        headers.set("x-client-secret", secret);
        headers.set("x-api-version", "2023-08-01");

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("customer_id", customerId != null ? customerId : "cust_" + orderId);
        customerDetails.put("customer_name", customerName != null ? customerName : "Customer");
        customerDetails.put("customer_phone", mobile != null && !mobile.trim().isEmpty() ? mobile : "9999999999");
        if (email != null && !email.trim().isEmpty()) {
            customerDetails.put("customer_email", email);
        }

        Map<String, Object> orderMeta = new HashMap<>();
        if (returnUrl != null && !returnUrl.trim().isEmpty()) {
            orderMeta.put("return_url", returnUrl);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("order_id", orderId);
        body.put("order_amount", amount);
        body.put("order_currency", "INR");
        body.put("customer_details", customerDetails);
        body.put("order_meta", orderMeta);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null) {
            responseBody.put("environment", secureStoreService.getConfigValueDecrypted(companyCode, "CASHFREE_ENV"));
        }
        return responseBody;
    }

    public Map<String, Object> verifyPayment(String companyCode, String orderId) {
        String appId = secureStoreService.getConfigValueDecrypted(companyCode, "CASHFREE_APP_ID");
        String secret = secureStoreService.getConfigValueDecrypted(companyCode, "CASHFREE_SECRET");

        if (appId == null || secret == null) {
            throw new RuntimeException("Cashfree payment gateway credentials are not configured in Secure Store.");
        }

        String url = getBaseUrl(companyCode) + "/orders/" + orderId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", appId);
        headers.set("x-client-secret", secret);
        headers.set("x-api-version", "2023-08-01");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        return response.getBody();
    }
}
