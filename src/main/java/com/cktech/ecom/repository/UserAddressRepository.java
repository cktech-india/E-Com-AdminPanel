package com.cktech.ecom.repository;

import com.cktech.ecom.model.user.UserAddressDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserAddressRepository extends GenericRepository<UserAddressDTO,Long> {

    List<UserAddressDTO> findByUserId(Long userId);
}
