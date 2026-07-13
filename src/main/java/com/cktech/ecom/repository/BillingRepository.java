package com.cktech.ecom.repository;

import com.cktech.ecom.model.billing.BillingDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingRepository extends GenericRepository<BillingDTO, Long> {

}