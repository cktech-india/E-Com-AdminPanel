package com.cktech.ecom.repository;

import com.cktech.ecom.model.faq.FaqDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaqRepository extends GenericRepository<FaqDTO, Long> {
}