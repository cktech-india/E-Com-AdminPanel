package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.GstHsnCodeDTO;
import com.cktech.ecom.repository.GstHsnCodeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GstHsnCodeService {
    private final GstHsnCodeRepository gstHsnCodeRepository;

    public GstHsnCodeService(GstHsnCodeRepository gstHsnCodeRepository) {
        this.gstHsnCodeRepository = gstHsnCodeRepository;
    }

    public GstHsnCodeDTO save(GstHsnCodeDTO gstHsnCode) {
        return gstHsnCodeRepository.save(gstHsnCode);
    }

    public GstHsnCodeDTO get(Integer id) {
        return gstHsnCodeRepository.findById(id).orElseThrow();
    }

    public List<GstHsnCodeDTO> getList() {
        return gstHsnCodeRepository.findByIsDeletedFalse();
    }

    public List<GstHsnCodeDTO> getActiveList() {
        return gstHsnCodeRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Integer id) {
        gstHsnCodeRepository.updateIsDeletedFlag(id, true, "id");
    }
}