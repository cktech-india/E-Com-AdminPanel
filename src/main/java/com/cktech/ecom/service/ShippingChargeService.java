package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.ShippingChargeDTO;
import com.cktech.ecom.repository.ShippingChargeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShippingChargeService {
    private final ShippingChargeRepository shippingChargeRepository;

    public ShippingChargeService(ShippingChargeRepository shippingChargeRepository) {
        this.shippingChargeRepository = shippingChargeRepository;
    }

    public ShippingChargeDTO save(ShippingChargeDTO shippingCharge) {
        return shippingChargeRepository.save(shippingCharge);
    }

    public ShippingChargeDTO get(Integer id) {
        return shippingChargeRepository.findById(id).orElseThrow();
    }

    public List<ShippingChargeDTO> getList() {
        return shippingChargeRepository.findByIsDeletedFalse();
    }

    public List<ShippingChargeDTO> getActiveList() {
        return shippingChargeRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Integer id) {
        shippingChargeRepository.updateIsDeletedFlag(id, true, "id");
    }
}