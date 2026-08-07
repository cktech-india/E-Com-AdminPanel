package com.cktech.ecom.repository.common;

import com.cktech.ecom.model.notification.NotificationLogDTO;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLogRepository extends GenericRepository<NotificationLogDTO, Long> {
}
