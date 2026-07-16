package com.cktech.ecom.repository;

import com.cktech.ecom.model.seo.SeoMetadataDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeoMetadataRepository extends GenericRepository<SeoMetadataDTO, Long> {
}
