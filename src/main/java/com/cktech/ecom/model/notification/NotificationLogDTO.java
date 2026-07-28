package com.cktech.ecom.model.notification;

import com.cktech.ecom.model.dto.Auditable;
import com.cktech.ecom.common.AppEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@lombok.EqualsAndHashCode(callSuper = false)
@Entity(name = "notification_log_t")
public class NotificationLogDTO extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notification_code", length = 20)
    private String notificationCode;

    @Enumerated(EnumType.STRING) // Explicitly save as String text "SMS"/"EMAIL" instead of integers
    @Column(name = "channel_type", length = 20)
    private AppEnum.ChannelType channelType;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500) // Lowered from 5000 unless you're storing hundreds of recipients in one row
    private String recipient;

    @Column(length = 1) // P - Pending, S - Sent, F - Failed
    private String status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String message;

    // --- Transient fields for business logic routing ---
    @Transient
    private Map<String, Object> param;

    @Transient
    private String fromEmail;
    @Transient
    private List<String> toEmail;
    @Transient
    private List<String> ccEmail;
    @Transient
    private List<String> bccEmail;

    @Transient
    private List<String> toMobile;

    @Transient
    private List<String> toPush;

    @Transient
    private List<String> attachmentS3Keys;

    @Transient
    private Set<AppEnum.ChannelType> targetChannels = new HashSet<>(); // All, SMS, EMAIL, PUSH

}

