package com.cktech.ecom.controller;

import com.cktech.ecom.common.AppEnum;
import com.cktech.ecom.model.user.UserDTO;
import com.cktech.ecom.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("")
    public ResponseEntity<UserDTO> save(@RequestBody UserDTO user) {
        // Hash password with SHA-256 if it is not already hashed (64 chars hex string)
        if (user.getPasswordHash() != null && user.getPasswordHash().length() != 64) {
            user.setPasswordHash(sha256(user.getPasswordHash()));
        }
        return ResponseEntity.ok(userService.save(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<UserDTO>> getList() {
        return ResponseEntity.ok(userService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<UserDTO>> getActiveList() {
        return ResponseEntity.ok(userService.getActiveUserList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<UserDTO> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        UserDTO user = userService.get(id);
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPasswordHash(sha256(newPassword));
        }
        return ResponseEntity.ok(userService.save(user));
    }

    @PostMapping("/{id}/change-role")
    public ResponseEntity<UserDTO> changeRole(@PathVariable Long id, @RequestParam("userType") String userType) {
        UserDTO user = userService.get(id);
        user.setUserType(AppEnum.USER_TYPE.valueOf(userType.toUpperCase()));
        return ResponseEntity.ok(userService.save(user));
    }

    private String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return base;
        }
    }
}
