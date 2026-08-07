package com.cktech.ecom.repository.paymentlog;

import com.cktech.ecom.model.paymentlog.PaymentLogDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentLogRepository extends JpaRepository<PaymentLogDTO, Long> {

    List<PaymentLogDTO> findByCompanyCodeAndOrderId(String companyCode, Long orderId);

    List<PaymentLogDTO> findByCompanyCodeAndOrderNumber(String companyCode, String orderNumber);
}
