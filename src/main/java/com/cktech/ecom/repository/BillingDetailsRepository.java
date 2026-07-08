package com.cktech.ecom.repository;

import com.cktech.ecom.model.billingdetails.BillingDetailsDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingDetailsRepository extends GenericRepository<BillingDetailsDTO, Long> {

}