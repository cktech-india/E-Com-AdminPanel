package com.cktech.ecom.repository;

import com.cktech.ecom.model.user.UserDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends GenericRepository<UserDTO,Long> {
}
