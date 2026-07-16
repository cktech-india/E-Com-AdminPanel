package com.cktech.ecom.service;

import com.cktech.ecom.model.product.WishlistDTO;
import com.cktech.ecom.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public WishlistDTO save(WishlistDTO wishlist) {
        return wishlistRepository.save(wishlist);
    }

    public WishlistDTO get(Long id) {
        return wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found with ID : " + id));
    }

    public List<WishlistDTO> getActiveWishlistList() {
        return wishlistRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        WishlistDTO wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found with ID : " + id));
        wishlist.setIsDeleted(true);
        wishlistRepository.save(wishlist);
    }
}
