package com.cktech.ecom.repository;

import com.cktech.ecom.model.tax.ContactInquiryDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactInquiryRepository extends GenericRepository<ContactInquiryDTO, Long> {
}