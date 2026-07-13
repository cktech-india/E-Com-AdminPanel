package com.cktech.ecom.service;

import com.cktech.ecom.model.product.DiscountDTO;
import com.cktech.ecom.repository.DiscountRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    public DiscountDTO save(DiscountDTO discount) {
        return discountRepository.save(discount);
    }

    public DiscountDTO get(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found with ID : " + id));
    }

    public List<DiscountDTO> getActiveDiscountList() {
        return discountRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {

        DiscountDTO discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found with ID : " + id));

        discount.setIsDeleted(true);

        discountRepository.save(discount);
    }
}