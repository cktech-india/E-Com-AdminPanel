package com.cktech.ecom.model.notification;

import com.cktech.ecom.common.AppEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class NotificationTemplateId implements Serializable {
    // These names and types must perfectly match the Entity's @Id fields
    private String notificationCode;
    private AppEnum.ChannelType channelType;
}
