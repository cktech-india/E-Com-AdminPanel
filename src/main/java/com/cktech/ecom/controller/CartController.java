package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.CartDTO;
import com.cktech.ecom.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    public ResponseEntity<CartDTO> save(@RequestBody CartDTO cart) {
        return ResponseEntity.ok(cartService.save(cart));
    }

    @GetMapping
    public ResponseEntity<List<CartDTO>> getAllCarts() {
        return ResponseEntity.ok(cartService.getActiveCartList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cartService.get(id));
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<CartDTO>> getActiveList() {
        return ResponseEntity.ok(cartService.getActiveCartList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        cartService.delete(id);
        return ResponseEntity.ok("Cart deleted successfully");
    }
}
