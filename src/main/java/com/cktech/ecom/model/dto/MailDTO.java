package com.cktech.ecom.model.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class MailDTO {

	private String from;
	private String subject;
	private String messageOrTemplate;
	private String[] to;
	private String[] bcc;
	private String[] cc;
	private List<String> attachmentLocations;
	private Map<String, Object> templateParams;
}
