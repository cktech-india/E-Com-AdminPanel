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

    public enum CONTACT_INQUIRY_STATUS {
        NEW, PENDING, RESOLVED
    }

    public enum MEDIA_TYPE {
        IMG, BR, REF
    }

    public enum ORDER_STATUS {
        PENDING("pending"),
        PAID("paid"),
        SHIPPED("shipped"),
        DELIVERED("delivered"),
        CANCELLED("cancelled");

        private final String value;
        ORDER_STATUS(String value) { this.value = value; }
        public String getValue() { return value; }

        @jakarta.persistence.Converter(autoApply = true)
        public static class Converter implements jakarta.persistence.AttributeConverter<ORDER_STATUS, String> {
            @Override
            public String convertToDatabaseColumn(ORDER_STATUS attribute) {
                return attribute == null ? null : attribute.getValue();
            }
            @Override
            public ORDER_STATUS convertToEntityAttribute(String dbData) {
                if (dbData == null) return null;
                for (ORDER_STATUS v : ORDER_STATUS.values()) {
                    if (v.getValue().equalsIgnoreCase(dbData)) return v;
                }
                throw new IllegalArgumentException("Unknown database value: " + dbData);
            }
        }
    }

    public enum STOCK_LOG_REASON {
        SALE("sale"),
        RETURN("return"),
        PURCHASE("purchase"),
        ADJUSTMENT("adjustment");

        private final String value;
        STOCK_LOG_REASON(String value) { this.value = value; }
        public String getValue() { return value; }

        @jakarta.persistence.Converter(autoApply = true)
        public static class Converter implements jakarta.persistence.AttributeConverter<STOCK_LOG_REASON, String> {
            @Override
            public String convertToDatabaseColumn(STOCK_LOG_REASON attribute) {
                return attribute == null ? null : attribute.getValue();
            }
            @Override
            public STOCK_LOG_REASON convertToEntityAttribute(String dbData) {
                if (dbData == null) return null;
                for (STOCK_LOG_REASON v : STOCK_LOG_REASON.values()) {
                    if (v.getValue().equalsIgnoreCase(dbData)) return v;
                }
                throw new IllegalArgumentException("Unknown database value: " + dbData);
            }
        }
    }

    public enum TAX_TYPE {
        SAME_STATE("same-state"),
        DIFFERENT_STATE("different-state");

        private final String value;
        TAX_TYPE(String value) { this.value = value; }
        public String getValue() { return value; }

        @jakarta.persistence.Converter(autoApply = true)
        public static class Converter implements jakarta.persistence.AttributeConverter<TAX_TYPE, String> {
            @Override
            public String convertToDatabaseColumn(TAX_TYPE attribute) {
                return attribute == null ? null : attribute.getValue();
            }
            @Override
            public TAX_TYPE convertToEntityAttribute(String dbData) {
                if (dbData == null) return null;
                for (TAX_TYPE v : TAX_TYPE.values()) {
                    if (v.getValue().equalsIgnoreCase(dbData)) return v;
                }
                throw new IllegalArgumentException("Unknown database value: " + dbData);
            }
        }
    }

    public static final Map<String, Integer> loginAttempts = new HashMap<>();

    public static final String COUNT_QUERY_BUILDER = "select COUNT(*) AS count FROM ( #query ) AS temp";
}

