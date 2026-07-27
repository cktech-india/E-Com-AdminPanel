package com.cktech.ecom.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface MasterCacheConfig {
    String category() default "";      // defaults to class name if empty
    String codeField() default "code"; // default field name
    String nameField() default "name"; // default field name
}
