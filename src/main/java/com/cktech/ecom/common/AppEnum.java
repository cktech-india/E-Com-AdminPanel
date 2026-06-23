package com.cktech.ecom.common;

import java.util.HashMap;
import java.util.Map;

public class AppEnum {
    private AppEnum() {
    }


    public enum RecordMode {
        C,
        E,
        D,
        V
    }

    public enum EMAIL_TYPE {
        TEXT,
        HTML,
        TEMPLATE
    }

    public enum USER_TYPE {
        ADM,
        USR
    }

    public static final Map<String, Integer> loginAttempts = new HashMap<>();

    public static final String COUNT_QUERY_BUILDER = "select COUNT(*) AS count FROM ( #query ) AS temp";
}

