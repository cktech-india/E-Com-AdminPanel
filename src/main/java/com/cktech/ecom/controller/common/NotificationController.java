package com.cktech.ecom.controller.common;

import com.cktech.ecom.model.reports.ResponseDTO;
import com.cktech.ecom.service.communication.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * The type Sms controller.
 */
@RestController
@RequestMapping("api/sms")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    /**
     * Trigger sms.
     * @param input   the input
     * @param smsCode the sms code
     * @param request the request
     */
    @PostMapping("trigger-sms/{smsCode}")
    public ResponseDTO trigger(@RequestBody final Map<String, Object> input, @PathVariable final String smsCode,
                               @RequestParam final String notifyChannel,
                               final HttpServletRequest request) {
        return service.trigger(input, smsCode,"admin","default", notifyChannel);
    }

    @GetMapping("templates")
    public java.util.List<com.cktech.ecom.model.notification.NotificationTemplateDTO> getTemplates() {
        return service.getTemplates();
    }

    @PostMapping("update")
    public ResponseDTO updateTemplate(@RequestBody com.cktech.ecom.model.notification.NotificationTemplateDTO template) {
        return service.saveTemplate(template);
    }

    @GetMapping("logs")
    public java.util.List<com.cktech.ecom.model.notification.NotificationLogDTO> getLogs() {
        return service.getLogs();
    }
}
