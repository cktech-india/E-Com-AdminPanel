package com.cktech.ecom.service;

import com.cktech.ecom.model.dto.CartItemCountDetailsDTO;
import com.cktech.ecom.model.product.CartDTO;
import com.cktech.ecom.model.product.CartItemDTO;
import com.cktech.ecom.repository.CartItemRepository;
import com.cktech.ecom.repository.CartRepository;
import jakarta.transaction.Transactional;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final QueryService queryService;

    public CartService(CartRepository cartRepository, 
                       CartItemRepository cartItemRepository,
                       org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate namedParameterJdbcTemplate,
                       QueryService queryService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.queryService = queryService;
    }

    public CartDTO save(CartDTO cart) {
        CartDTO savedCart = cartRepository.save(cart);
        if (cart.getItems() != null) {
            for (CartItemDTO item : cart.getItems()) {
                item.setCartId(savedCart.getId());
                item.setCompanyCode(savedCart.getCompanyCode());
                item.setUserId(savedCart.getUserId());
                cartItemRepository.save(item);
            }
        }
        return get(savedCart.getId());
    }

    public CartDTO get(Long id) {
        CartDTO cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart not found with ID : " + id));
        cart.setItems(cartItemRepository.findByCartId(cart.getId()));
        return cart;
    }

    public List<CartDTO> getActiveCartList() {
        List<CartDTO> carts = cartRepository.findByIsDeletedFalseAndIsActiveTrue();
        for (CartDTO cart : carts) {
            cart.setItems(cartItemRepository.findByCartId(cart.getId()));
        }
        return carts;
    }

    public List<CartItemCountDetailsDTO> getCartItemCountDetails() {
        String sql = queryService.getQuery("SELECT_CART_ITEMS_COUNT_DETAILS");
        return namedParameterJdbcTemplate.query(
             sql,new HashMap<>(),new BeanPropertyRowMapper<>(CartItemCountDetailsDTO.class)
        );
    }

}
