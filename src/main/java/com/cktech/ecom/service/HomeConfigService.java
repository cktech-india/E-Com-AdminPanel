package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.HomeConfigDTO;
import com.cktech.ecom.repository.HomeConfigRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomeConfigService {
    private final HomeConfigRepository homeConfigRepository;

    public HomeConfigService(HomeConfigRepository homeConfigRepository) {
        this.homeConfigRepository = homeConfigRepository;
    }

    public HomeConfigDTO save(HomeConfigDTO homeConfig) {
        return homeConfigRepository.save(homeConfig);
    }

    public HomeConfigDTO get(Long id) {
        return homeConfigRepository.findById(id).orElseThrow();
    }

    public List<HomeConfigDTO> getList() {
        return homeConfigRepository.findByIsDeletedFalse();
    }

    public List<HomeConfigDTO> getActiveList() {
        return homeConfigRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = homeConfigRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        homeConfigRepository.save(data);
    }
}