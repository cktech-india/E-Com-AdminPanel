package com.cktech.ecom.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

public class AesEncryptor {

    private static final String DEFAULT_SECRET_KEY = "cktech";

    private static SecretKeySpec getKey(String secretKey) throws Exception {
        String keyToUse = (secretKey == null || secretKey.trim().isEmpty()) ? DEFAULT_SECRET_KEY : secretKey;
        byte[] key = keyToUse.getBytes(StandardCharsets.UTF_8);
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        key = sha.digest(key);
        key = Arrays.copyOf(key, 16); // 128-bit key length
        return new SecretKeySpec(key, "AES");
    }

    public static String encrypt(String valueToEncrypt, String secretKey) {
        if (valueToEncrypt == null || valueToEncrypt.trim().isEmpty()) {
            return valueToEncrypt;
        }
        try {
            SecretKeySpec secretKeySpec = getKey(secretKey);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            byte[] encryptedBytes = cipher.doFinal(valueToEncrypt.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting secure store value", e);
        }
    }

    public static String decrypt(String encryptedValue, String secretKey) {
        if (encryptedValue == null || encryptedValue.trim().isEmpty()) {
            return encryptedValue;
        }
        try {
            SecretKeySpec secretKeySpec = getKey(secretKey);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedValue);
            return new String(cipher.doFinal(decodedBytes), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Return raw value if not encrypted or decryption fails
            return encryptedValue;
        }
    }
}
