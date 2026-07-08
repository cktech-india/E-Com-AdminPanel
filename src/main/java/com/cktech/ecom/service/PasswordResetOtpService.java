package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.PasswordResetOtpDTO;
import com.cktech.ecom.repository.PasswordResetOtpRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PasswordResetOtpService {
    private final PasswordResetOtpRepository passwordResetOtpRepository;

    public PasswordResetOtpService(PasswordResetOtpRepository passwordResetOtpRepository) {
        this.passwordResetOtpRepository = passwordResetOtpRepository;
    }

    public PasswordResetOtpDTO save(PasswordResetOtpDTO passwordResetOtp) {
        return passwordResetOtpRepository.save(passwordResetOtp);
    }

    public PasswordResetOtpDTO get(Integer id) {
        return passwordResetOtpRepository.findById(id).orElseThrow();
    }

    public List<PasswordResetOtpDTO> getList() {
        return passwordResetOtpRepository.findByIsDeletedFalse();
    }

    public List<PasswordResetOtpDTO> getActiveList() {
        return passwordResetOtpRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Integer id) {
        var data = passwordResetOtpRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        passwordResetOtpRepository.save(data);
    }
}