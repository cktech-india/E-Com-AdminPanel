package com.cktech.ecom.repository;

import com.cktech.ecom.model.category.CategoryDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends GenericRepository<CategoryDTO, Long> {
}