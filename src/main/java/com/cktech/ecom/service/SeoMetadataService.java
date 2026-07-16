package com.cktech.ecom.service;

import com.cktech.ecom.model.seo.SeoMetadataDTO;
import com.cktech.ecom.repository.SeoMetadataRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeoMetadataService {

    private final SeoMetadataRepository seoMetadataRepository;

    public SeoMetadataService(SeoMetadataRepository seoMetadataRepository) {
        this.seoMetadataRepository = seoMetadataRepository;
    }

    public SeoMetadataDTO save(SeoMetadataDTO seo) {
        return seoMetadataRepository.save(seo);
    }

    public SeoMetadataDTO get(Long id) {
        return seoMetadataRepository.findById(id).orElseThrow();
    }

    public List<SeoMetadataDTO> getList() {
        return seoMetadataRepository.findByIsDeletedFalse();
    }

    @Transactional
    public void delete(Long id) {
        var data = seoMetadataRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        seoMetadataRepository.save(data);
    }
}
