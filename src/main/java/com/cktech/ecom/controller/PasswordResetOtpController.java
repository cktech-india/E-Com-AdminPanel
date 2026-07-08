package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.PasswordResetOtpDTO;
import com.cktech.ecom.service.PasswordResetOtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/password-reset-otp")
public class PasswordResetOtpController {

    private final PasswordResetOtpService passwordResetOtpService;

    public PasswordResetOtpController(PasswordResetOtpService passwordResetOtpService) {
        this.passwordResetOtpService = passwordResetOtpService;
    }

    @PostMapping("")
    public ResponseEntity<PasswordResetOtpDTO> create(@RequestBody PasswordResetOtpDTO dto) {
        return ResponseEntity.ok(passwordResetOtpService.save(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PasswordResetOtpDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(passwordResetOtpService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<PasswordResetOtpDTO>> getList() {
        return ResponseEntity.ok(passwordResetOtpService.getList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        passwordResetOtpService.delete(id);
        return ResponseEntity.ok("Password Reset Otp deleted successfully");
    }
}