package com.cktech.ecom.repository.securestore;

import com.cktech.ecom.model.securestore.SecureStoreDTO;
import com.cktech.ecom.model.securestore.SecureStoreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecureStoreRepository extends JpaRepository<SecureStoreDTO, SecureStoreId> {

    List<SecureStoreDTO> findByCompanyCode(String companyCode);

    List<SecureStoreDTO> findByCompanyCodeAndGroupType(String companyCode, String groupType);

    List<SecureStoreDTO> findByCompanyCodeAndGroupTypeAndGroupName(String companyCode, String groupType, String groupName);

    Optional<SecureStoreDTO> findByCompanyCodeAndConfigCode(String companyCode, String configCode);

    @Query("SELECT DISTINCT s.groupName FROM SecureStoreDTO s WHERE s.companyCode = :companyCode AND s.groupType = 'PAYMENT_GATEWAY' AND s.groupName IS NOT NULL")
    List<String> findDistinctGatewayNames(@Param("companyCode") String companyCode);
}
