package com.cktech.ecom.config.cache;

import com.cktech.ecom.config.MasterCacheConfig;
import com.cktech.ecom.repository.common.GenericRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.ApplicationContext;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.HashMap;
import java.util.Map;

@Component
public class CacheService {
    private final ApplicationContext applicationContext;
    private Map<String, Map<String, Object>> masterDataCache = new HashMap<>();

    public CacheService(ApplicationContext applicationContextIn) {
        this.applicationContext = applicationContextIn;
    }

    @PostConstruct
    public void init() {
        refreshAllCache();
    }

    public void refreshCache(Object entity) {
        Class<?> clazz = entity.getClass();

        MasterCacheConfig config = clazz.getAnnotation(MasterCacheConfig.class);

        String category = (config != null && !config.category().isEmpty())
                ? config.category()
                : clazz.getSimpleName().toLowerCase();

        String codeFieldName = (config != null) ? config.codeField() : "code";
        String nameFieldName = (config != null) ? config.nameField() : "name";

        try {
            Field codeField = clazz.getDeclaredField(codeFieldName);
            Field nameField = clazz.getDeclaredField(nameFieldName);

            codeField.setAccessible(true);  // allow access to private fields
            nameField.setAccessible(true);
            String code = String.valueOf(codeField.get(entity));
            String name = String.valueOf(nameField.get(entity));
            masterDataCache.computeIfAbsent(category, k -> new HashMap<>()).put(code, name);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Error reading master data fields for " + clazz.getName(), e);
        }
    }


    public void refreshAllCache() {
        // Get all beans that are repositories
        String[] repoBeanNames = applicationContext.getBeanNamesForType(GenericRepository.class);
        for (String beanName : repoBeanNames) {
            Object repoBean = applicationContext.getBean(beanName);
            // Try to resolve the domain class from the repository
            Class<?> repoInterface = repoBean.getClass().getInterfaces()[0];
            if (!(repoBean instanceof CrudRepository)) {
                continue;
            }
            // Extract domain type
            ParameterizedType type = (ParameterizedType) repoInterface.getGenericInterfaces()[0];
            Class<?> domainType = (Class<?>) type.getActualTypeArguments()[0];
            // Only process entities with @MasterCacheConfig
            if (domainType.isAnnotationPresent(MasterCacheConfig.class)) {
                CrudRepository<?, ?> crudRepo = (CrudRepository<?, ?>) repoBean;
                Iterable<?> allEntities = crudRepo.findAll();
                allEntities.forEach(this::refreshCache);
            }
        }
    }

    public Object getCachedValue(String category, String code) {
        Map<String, Object> categoryCache = masterDataCache.get(category);
        return categoryCache != null ? categoryCache.get(code) : null;
    }
}
