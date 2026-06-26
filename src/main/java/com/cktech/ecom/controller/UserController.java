package com.cktech.ecom.controller;

import com.cktech.ecom.model.user.UserDTO;
import com.cktech.ecom.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("")
    public ResponseEntity<UserDTO> save(@RequestBody UserDTO user) {
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
}
