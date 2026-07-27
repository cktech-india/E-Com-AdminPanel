package com.cktech.ecom.service;

import com.cktech.ecom.model.config.AppConfigDTO;
import com.cktech.ecom.repository.AppConfigRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppConfigService {

    private final AppConfigRepository appConfigRepository;

    public AppConfigService(AppConfigRepository appConfigRepository) {
        this.appConfigRepository = appConfigRepository;
    }

    public AppConfigDTO save(AppConfigDTO config) {
        return appConfigRepository.save(config);
    }

    public AppConfigDTO get(Long id) {
        return appConfigRepository.findById(id).orElseThrow();
    }

    public List<AppConfigDTO> getList() {
        return appConfigRepository.findByIsDeletedFalse();
    }

    @Transactional
    public void delete(Long id) {
        var data = appConfigRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        appConfigRepository.save(data);
    }
}
