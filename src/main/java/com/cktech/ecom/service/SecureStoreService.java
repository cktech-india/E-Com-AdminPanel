package com.cktech.ecom.service;

import com.cktech.ecom.model.securestore.SecureStoreDTO;
import com.cktech.ecom.model.securestore.SecureStoreId;
import com.cktech.ecom.repository.securestore.SecureStoreRepository;
import com.cktech.ecom.util.AesEncryptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SecureStoreService {

    private final SecureStoreRepository secureStoreRepository;

    @Value("${jwt.secret:cktech}")
    private String jwtSecret;

    public SecureStoreService(SecureStoreRepository secureStoreRepository) {
        this.secureStoreRepository = secureStoreRepository;
    }

    public void saveOrUpdateConfig(String companyCode, String configCode, String rawValue, String groupName, String groupType, String user) {
        String encryptedValue = AesEncryptor.encrypt(rawValue, jwtSecret);

        SecureStoreId id = new SecureStoreId(companyCode, configCode);
        SecureStoreDTO dto = secureStoreRepository.findById(id).orElseGet(() -> {
            SecureStoreDTO newDto = new SecureStoreDTO();
            newDto.setCompanyCode(companyCode);
            newDto.setConfigCode(configCode);
            newDto.setCreatedBy(user);
            return newDto;
        });

        dto.setConfigValue(encryptedValue);
        dto.setGroupName(groupName);
        dto.setGroupType(groupType);
        dto.setLastModifiedBy(user);

        secureStoreRepository.save(dto);
    }

    public String getConfigValueDecrypted(String companyCode, String configCode) {
        Optional<SecureStoreDTO> opt = secureStoreRepository.findByCompanyCodeAndConfigCode(companyCode, configCode);
        if (opt.isEmpty() || opt.get().getConfigValue() == null) {
            return null;
        }
        return AesEncryptor.decrypt(opt.get().getConfigValue(), jwtSecret);
    }

    public List<Map<String, Object>> getAllConfigs(String companyCode, String groupType, String groupName) {
        List<SecureStoreDTO> list;
        if (groupType != null && !groupType.trim().isEmpty() && groupName != null && !groupName.trim().isEmpty()) {
            list = secureStoreRepository.findByCompanyCodeAndGroupTypeAndGroupName(companyCode, groupType, groupName);
        } else if (groupType != null && !groupType.trim().isEmpty()) {
            list = secureStoreRepository.findByCompanyCodeAndGroupType(companyCode, groupType);
        } else {
            list = secureStoreRepository.findByCompanyCode(companyCode);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (SecureStoreDTO dto : list) {
            Map<String, Object> map = new HashMap<>();
            String decrypted = AesEncryptor.decrypt(dto.getConfigValue(), jwtSecret);
            map.put("companyCode", dto.getCompanyCode());
            map.put("configCode", dto.getConfigCode());
            map.put("configValue", decrypted);
            map.put("maskedValue", maskValue(decrypted));
            map.put("groupName", dto.getGroupName());
            map.put("groupType", dto.getGroupType());
            map.put("createdBy", dto.getCreatedBy());
            map.put("createdDate", dto.getCreatedDate());
            map.put("lastModifiedBy", dto.getLastModifiedBy());
            map.put("lastModifiedDate", dto.getLastModifiedDate());
            result.add(map);
        }
        return result;
    }

    public List<String> getAvailablePaymentGateways(String companyCode) {
        return secureStoreRepository.findDistinctGatewayNames(companyCode);
    }

    public void deleteConfig(String companyCode, String configCode) {
        SecureStoreId id = new SecureStoreId(companyCode, configCode);
        secureStoreRepository.deleteById(id);
    }

    private String maskValue(String val) {
        if (val == null || val.length() <= 4) return "****";
        return val.substring(0, 2) + "****" + val.substring(val.length() - 2);
    }
}
