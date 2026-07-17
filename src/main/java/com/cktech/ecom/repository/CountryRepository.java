package com.cktech.ecom.repository;

import com.cktech.ecom.model.country.CountryDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepository extends GenericRepository<CountryDTO, Long> {
}
