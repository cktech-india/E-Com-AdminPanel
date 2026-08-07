package com.cktech.ecom.controller;

import com.cktech.ecom.model.orders.OrdersDTO;
import com.cktech.ecom.model.paymentlog.PaymentLogDTO;
import com.cktech.ecom.repository.paymentlog.PaymentLogRepository;
import com.cktech.ecom.repository.OrdersRepository;
import com.cktech.ecom.service.CashfreeService;
import com.cktech.ecom.service.SecureStoreService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {

    private final SecureStoreService secureStoreService;
    private final CashfreeService cashfreeService;
    private final OrdersRepository ordersRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentController(SecureStoreService secureStoreService,
                             CashfreeService cashfreeService,
                             OrdersRepository ordersRepository,
                             PaymentLogRepository paymentLogRepository) {
        this.secureStoreService = secureStoreService;
        this.cashfreeService = cashfreeService;
        this.ordersRepository = ordersRepository;
        this.paymentLogRepository = paymentLogRepository;
    }

    @GetMapping("/gateways")
    public ResponseEntity<Map<String, Object>> getAvailableGateways(@RequestParam String companyCode) {
        List<String> gateways = secureStoreService.getAvailablePaymentGateways(companyCode);
        List<Map<String, String>> gatewayList = new ArrayList<>();
        // Always include Cash on Delivery
        gatewayList.add(Map.of("code", "COD", "name", "Cash on Delivery", "type", "OFFLINE"));

        for (String gw : gateways) {
            if ("CASHFREE".equalsIgnoreCase(gw)) {
                gatewayList.add(Map.of("code", "CASHFREE", "name", "Cashfree Online Payment (UPI, Cards, NetBanking)", "type", "ONLINE"));
            } else {
                gatewayList.add(Map.of("code", gw, "name", gw + " Online Payment", "type", "ONLINE"));
            }
        }

        return ResponseEntity.ok(Map.of("status", "SUCCESS", "gateways", gatewayList));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> req) {
        try {
            String companyCode = (String) req.get("companyCode");
            String orderIdStr = String.valueOf(req.get("orderId"));
            String gateway = (String) req.getOrDefault("gateway", "CASHFREE");
            double amount = req.get("amount") != null ? Double.parseDouble(req.get("amount").toString()) : 0.0;
            String customerId = req.get("customerId") != null ? req.get("customerId").toString() : null;
            String customerName = req.get("customerName") != null ? req.get("customerName").toString() : null;
            String mobile = req.get("mobile") != null ? req.get("mobile").toString() : null;
            String email = req.get("email") != null ? req.get("email").toString() : null;
            String returnUrl = req.get("returnUrl") != null ? req.get("returnUrl").toString() : null;

            if ("CASHFREE".equalsIgnoreCase(gateway)) {
                Map<String, Object> cfRes = cashfreeService.createOrder(companyCode, orderIdStr, amount, customerId, customerName, mobile, email, returnUrl);
                
                String paymentSessionId = (String) cfRes.get("payment_session_id");
                String env = (String) cfRes.get("environment");

                // Log initial payment attempt in payment_logs_t
                PaymentLogDTO log = new PaymentLogDTO();
                log.setCompanyCode(companyCode);
                log.setOrderNumber(orderIdStr);
                log.setPaymentGateway("CASHFREE");
                log.setGatewayOrderId(String.valueOf(cfRes.get("order_id")));
                log.setPaymentStatus("INITIATED");
                log.setPaymentAmount(BigDecimal.valueOf(amount));
                log.setGatewayApiResponse(objectMapper.writeValueAsString(cfRes));
                paymentLogRepository.save(log);

                Map<String, Object> res = new HashMap<>();
                res.put("status", "SUCCESS");
                res.put("paymentSessionId", paymentSessionId);
                res.put("orderId", orderIdStr);
                res.put("environment", env);
                return ResponseEntity.ok(res);
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Unsupported payment gateway: " + gateway));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> req) {
        try {
            String companyCode = (String) req.get("companyCode");
            String orderIdStr = String.valueOf(req.get("orderId"));
            String gateway = (String) req.getOrDefault("gateway", "CASHFREE");

            if ("CASHFREE".equalsIgnoreCase(gateway)) {
                Map<String, Object> verifyRes = cashfreeService.verifyPayment(companyCode, orderIdStr);
                String orderStatus = (String) verifyRes.get("order_status");

                String paymentId = null;
                if (verifyRes.containsKey("payment_id")) {
                    paymentId = String.valueOf(verifyRes.get("payment_id"));
                }

                // Log payment verification attempt in payment_logs_t
                PaymentLogDTO log = new PaymentLogDTO();
                log.setCompanyCode(companyCode);
                log.setOrderNumber(orderIdStr);
                log.setPaymentGateway("CASHFREE");
                log.setGatewayOrderId(orderIdStr);
                log.setGatewayPaymentId(paymentId);
                log.setPaymentStatus(orderStatus);
                if (verifyRes.get("order_amount") != null) {
                    log.setPaymentAmount(new BigDecimal(verifyRes.get("order_amount").toString()));
                }
                log.setGatewayApiResponse(objectMapper.writeValueAsString(verifyRes));
                paymentLogRepository.save(log);

                // Update order record in orders_t if found
                Optional<OrdersDTO> orderOpt = ordersRepository.findByOrderNumber(orderIdStr);
                if (orderOpt.isPresent()) {
                    OrdersDTO order = orderOpt.get();
                    order.setPaymentGateway("CASHFREE");
                    order.setGatewayPaymentId(paymentId);
                    order.setPaymentStatus(orderStatus);
                    if ("PAID".equalsIgnoreCase(orderStatus) || "SUCCESS".equalsIgnoreCase(orderStatus)) {
                        order.setStatus(com.cktech.ecom.common.AppEnum.ORDER_STATUS.PAID);
                    }
                    ordersRepository.save(order);
                }

                Map<String, Object> res = new HashMap<>();
                res.put("status", "PAID".equalsIgnoreCase(orderStatus) ? "SUCCESS" : "FAILED");
                res.put("orderStatus", orderStatus);
                res.put("orderId", orderIdStr);
                res.put("paymentId", paymentId);
                res.put("gatewayResponse", verifyRes);
                return ResponseEntity.ok(res);
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Unsupported payment gateway: " + gateway));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
}
