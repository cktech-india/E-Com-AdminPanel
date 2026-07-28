package com.cktech.ecom.service.communication;

import com.cktech.ecom.model.dto.MailDTO;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import java.io.File;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class EmailService {

    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);
    private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender javaMailSender;

    @Value("${file.assets.path:config/assets/}mail-templates/")
    private String templateLocation;
    @Value("${mail.subject.additional:}")
    private String subjectAdditional;
    @Value("${mail.from.name:FinApp - Notification}")
    private String mailFromName;

    @Value("${mail.from:${spring.mail.username:admin@cktechindia.com}}")
    private String mailFrom;


    public EmailService(final JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }


    public String sendEmail(MailDTO mailInfo) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "utf-8");

            helper.setTo(getInternetAddresses(mailInfo.getTo()));
            String subject = mailInfo.getSubject();
            if (subjectAdditional != null && !subjectAdditional.isBlank()) {
                subject = subjectAdditional.concat(" ").concat(subject);
            }
            helper.setSubject(subject);
            if (mailInfo.getBcc() != null) {
                helper.setBcc(getInternetAddresses(mailInfo.getBcc()));
            }
            String fromAddress = mailInfo.getFrom();
            if (fromAddress == null || fromAddress.isBlank()) {
                fromAddress = mailFrom;
            }
            if (fromAddress == null || fromAddress.isBlank()) {
                fromAddress = "admin@cktechindia.com";
            }

            String fromName = mailFromName;
            if (fromName == null || fromName.isBlank()) {
                fromName = "Sinjay Mart";
            }

            helper.setFrom(fromAddress, fromName);

            if (mailInfo.getCc() != null) {
                helper.setCc(getInternetAddresses(mailInfo.getCc()));
            }

            helper.setText(processTemplate(mailInfo.getMessageOrTemplate(),
                    mailInfo.getTemplateParams()), true);
            if (mailInfo.getAttachmentLocations() != null) {
                for (var attachment : mailInfo.getAttachmentLocations()) {
                    try {
                        String filename = null;
                        String location = attachment;
                        if (attachment.contains("|")) {
                            String[] parts = attachment.split("\\|", 2);
                            filename = parts[0];
                            location = parts[1];
                        }
                        if (location.startsWith("data:") && location.contains("base64,")) {
                            String base64Data = location.substring(location.indexOf("base64,") + 7);
                            byte[] decoded = java.util.Base64.getDecoder().decode(base64Data.trim());
                            if (filename == null || filename.isBlank()) {
                                filename = "document.pdf";
                            }
                            helper.addAttachment(filename, new org.springframework.core.io.ByteArrayResource(decoded));
                        } else if (location.startsWith("http://") || location.startsWith("https://")) {
                            org.springframework.core.io.UrlResource resource = new org.springframework.core.io.UrlResource(location);
                            if (filename == null || filename.isBlank()) {
                                filename = resource.getFilename();
                            }
                            if (filename == null || filename.isBlank()) {
                                filename = "document.pdf";
                            }
                            helper.addAttachment(filename, resource);
                        } else {
                            File file = new File(location);
                            byte[] decodedBytes = null;
                            if (!file.exists()) {
                                try {
                                    decodedBytes = java.util.Base64.getDecoder().decode(location.trim());
                                } catch (IllegalArgumentException e) {
                                    // Not base64
                                }
                            }
                            if (decodedBytes != null) {
                                if (filename == null || filename.isBlank()) {
                                    filename = "document.pdf";
                                }
                                helper.addAttachment(filename, new org.springframework.core.io.ByteArrayResource(decodedBytes));
                            } else {
                                if (filename == null || filename.isBlank()) {
                                    filename = file.getName();
                                }
                                helper.addAttachment(filename, file);
                            }
                        }
                    } catch (Exception ex) {
                        LOG.error("Mail File Not Found or Failed to Attach : ", ex);
                    }
                }
            }
            javaMailSender.send(mimeMessage);
            String successMSG = "Mail Sent Successfully!!! - To : "
                    + Arrays.toString(mailInfo.getTo()) + " CC : " + Arrays.toString(mailInfo.getCc());
            LOG.info(successMSG);
            return "S";
        } catch (Exception ex) {
            LOG.error("Error : ", ex);
            return ex.getLocalizedMessage();
        }
    }

    public String processTemplate(final String templateName, final Map<String, Object> parameters) {
        try {
            var context = new Context();
            if (parameters != null) {
                for (var item : Objects.requireNonNull(parameters.entrySet())) {
                    context.setVariable(item.getKey(), item.getValue());
                }
            }
            var templateEngine1 = new SpringTemplateEngine();
            StringTemplateResolver templateResolver1 = new StringTemplateResolver();
            templateResolver1.setOrder(templateEngine1.getTemplateResolvers().size());
            templateEngine1.setTemplateResolver(templateResolver1);
            return templateEngine1.process(templateName, context);
        } catch (Exception ex) {
            LOG.error("Error : ", ex);
            return templateName;
        }
    }

    /**
     * This method is used to get mail id.
     *
     * @param mailIds queryName
     * @return address address
     */
    private InternetAddress[] getInternetAddresses(final String[] mailIds) {
        List<InternetAddress> emails = new ArrayList<>();
        for (String mailId : mailIds) {
            try {
                emails.add(new InternetAddress(mailId));
            } catch (AddressException e) {
                LOG.error("Invalid address:: {}", mailId, e);
            }
        }
        return emails.toArray(new InternetAddress[0]);
    }}
