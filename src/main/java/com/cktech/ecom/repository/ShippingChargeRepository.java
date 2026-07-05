package com.cktech.ecom.repository;

import com.cktech.ecom.model.shipping.ShippingChargeDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingChargeRepository extends GenericRepository<ShippingChargeDTO, Integer> {
}