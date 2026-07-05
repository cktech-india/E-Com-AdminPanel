package com.cktech.ecom.repository;

import com.cktech.ecom.model.tax.GstHsnCodeDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GstHsnCodeRepository extends GenericRepository<GstHsnCodeDTO, Integer> {
}