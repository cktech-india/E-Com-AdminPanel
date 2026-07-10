package com.cktech.ecom.repository;

import com.cktech.ecom.model.state.StateDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StateRepository extends GenericRepository<StateDTO, Long> {
}