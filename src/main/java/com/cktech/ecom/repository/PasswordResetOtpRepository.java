package com.cktech.ecom.repository;

import com.cktech.ecom.model.tax.PasswordResetOtpDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetOtpRepository extends GenericRepository<PasswordResetOtpDTO, Integer> {
}