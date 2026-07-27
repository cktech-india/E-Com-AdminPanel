package com.cktech.ecom.common;

import com.cktech.ecom.config.cache.CacheService;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;

public class MasterDataEntityListener {
    private static CacheService cacheService;

    @Autowired
    public void init(CacheService cacheService) {
        MasterDataEntityListener.cacheService = cacheService;
    }

    @PostPersist
    @PostUpdate
    public void afterSave(Object entity) {
        cacheService.refreshCache(entity);
    }
}