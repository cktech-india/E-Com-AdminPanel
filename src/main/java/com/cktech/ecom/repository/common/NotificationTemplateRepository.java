package com.cktech.ecom.repository.common;


import com.cktech.ecom.model.notification.NotificationTemplateDTO;
import com.cktech.ecom.model.notification.NotificationTemplateId;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationTemplateRepository
        extends GenericRepository<NotificationTemplateDTO, NotificationTemplateId> {
    // The second type MUST be NotificationTemplateIdDTO

    List<NotificationTemplateDTO> findByNotificationCodeAndIsActiveTrue(String notificationCode);
}
