package com.cktech.ecom.service;

import com.cktech.ecom.model.product.ProductMediaDTO;
import com.cktech.ecom.repository.ProductMediaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductMediaService {

    private final ProductMediaRepository productMediaRepository;

    public ProductMediaService(ProductMediaRepository productMediaRepository) {
        this.productMediaRepository = productMediaRepository;
    }

    public ProductMediaDTO save(ProductMediaDTO productMedia) {
        return productMediaRepository.save(productMedia);
    }

    public ProductMediaDTO get(Long id) {
        return productMediaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product Media not found with ID : " + id));
    }




    public List<ProductMediaDTO> getActiveProductMediaList() {
        return productMediaRepository.findByIsDeletedFalseAndIsActiveTrue();
    }



    @Transactional
    public void delete(Long id) {
        ProductMediaDTO productMedia = productMediaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product Media not found with ID : " + id));

        productMedia.setIsDeleted(true);
        productMediaRepository.save(productMedia);
    }
}