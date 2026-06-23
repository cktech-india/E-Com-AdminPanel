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
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO user) {
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findByUserId(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getByUserId(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<UserDTO>> userList() {
        return ResponseEntity.ok(userService.getActiveUserList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.markAsDeleted(id);
        return ResponseEntity.ok(
                "User deleted successfully");
    }
}
