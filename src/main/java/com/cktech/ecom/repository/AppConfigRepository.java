package com.cktech.ecom.repository;

import com.cktech.ecom.model.config.AppConfigDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppConfigRepository extends GenericRepository<AppConfigDTO, Long> {
}
