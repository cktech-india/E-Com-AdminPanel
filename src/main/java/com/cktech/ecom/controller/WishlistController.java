package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.WishlistDTO;
import com.cktech.ecom.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping
    public ResponseEntity<WishlistDTO> save(@RequestBody WishlistDTO wishlist) {
        return ResponseEntity.ok(wishlistService.save(wishlist));
    }

    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getAllWishlistItems() {
        return ResponseEntity.ok(wishlistService.getActiveWishlistList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WishlistDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(wishlistService.get(id));
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<WishlistDTO>> getActiveList() {
        return ResponseEntity.ok(wishlistService.getActiveWishlistList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        wishlistService.delete(id);
        return ResponseEntity.ok("Wishlist item deleted successfully");
    }
}
