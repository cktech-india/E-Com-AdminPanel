package com.cktech.ecom.model.notification;

import com.cktech.ecom.common.AppEnum;
import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
@lombok.EqualsAndHashCode(callSuper = false)
@Entity(name = "notification_template_t")
@EntityListeners(AuditingEntityListener.class)
@IdClass(NotificationTemplateId.class)
public class NotificationTemplateDTO extends Auditable {

    @Id
    @Column(name = "notification_code", length = 50)
    private String notificationCode;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type", length = 20)
    private AppEnum.ChannelType channelType;

    @Column(name = "notification_name", length = 150)
    private String notificationName;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "applicable_credit")
    private Integer applicableCredit;

    @Column(columnDefinition = "TEXT")
    private String systemParams;

    @Column(columnDefinition = "TEXT")
    private String defaultInput;

    // Custom Getters and Setters for Frontend DTO Compatibility

    public String getNotifyChannel() {
        return channelType != null ? channelType.name() : null;
    }

    public void setNotifyChannel(String notifyChannel) {
        if (notifyChannel != null) {
            try {
                this.channelType = AppEnum.ChannelType.valueOf(notifyChannel.toUpperCase());
            } catch (Exception e) {
                // Ignore
            }
        }
    }

    public String getMessageContent() {
        return content;
    }

    public void setMessageContent(String messageContent) {
        this.content = messageContent;
    }

    public String getDefaultInputs() {
        return defaultInput;
    }

    public void setDefaultInputs(String defaultInputs) {
        this.defaultInput = defaultInputs;
    }

    public boolean getActiveStatus() {
        return this.getIsActive() != null ? this.getIsActive() : true;
    }

    public void setActiveStatus(boolean activeStatus) {
        this.setIsActive(activeStatus);
    }
}
