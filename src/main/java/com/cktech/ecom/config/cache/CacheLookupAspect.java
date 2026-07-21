package com.cktech.ecom.config.cache;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.Collection;

@Aspect
@Component
public class CacheLookupAspect {

    private final CacheService cacheService;

    public CacheLookupAspect(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @AfterReturning(pointcut = "execution(* com.cktech.ecom.service.*.*(..))", returning = "result")
    public void populateCacheLookupFields(JoinPoint joinPoint, Object result) {
        if (result == null) {
            return;
        }

        if (result instanceof Page) {
            // If it's a Page, process the list inside it
            ((Page<?>) result).getContent().forEach(this::processObject);
        } else if (result instanceof Collection) {
            ((Collection<?>) result).forEach(this::processObject);
        } else {
            processObject(result);
        }
    }

    private void processObject(Object obj) {
        if (obj == null) {
            return;
        }

        Class<?> clazz = obj.getClass();
        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(CacheLookup.class)) {
                field.setAccessible(true);
                CacheLookup annotation = field.getAnnotation(CacheLookup.class);
                try {
                    String category = annotation.category();
                    String codeFieldName = annotation.codeField();

                    Field codeField = clazz.getDeclaredField(codeFieldName);
                    codeField.setAccessible(true);
                    Object codeObj = codeField.get(obj);
                    if (codeObj != null) {
                        String code = String.valueOf(codeObj);
                        Object cachedValue = cacheService.getCachedValue(category, code);
                        if (cachedValue != null) {
                            field.set(obj, cachedValue);
                        }
                    }
                } catch (Exception e) {
                    // Log or handle the exception appropriately
                    System.err.println("Error processing @CacheLookup on field " + field.getName() + ": " + e.getMessage());
                }
            }
        }
    }
}