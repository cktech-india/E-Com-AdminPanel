package com.cktech.ecom.service;

import com.cktech.ecom.model.dto.Auditable;
import com.cktech.ecom.model.user.UserAddressDTO;
import com.cktech.ecom.model.user.UserDTO;
import com.cktech.ecom.repository.UserAddressRepository;
import com.cktech.ecom.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;

    public UserService(UserRepository userRepository, UserAddressRepository userAddressRepository) {
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
    }

    public UserDTO save(UserDTO user) {
        // Save addresses
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            for (UserAddressDTO address : user.getAddresses()) {
                address.setUserId(user.getId());
                address.setCompanyCode(user.getCompanyCode()); // optional
            }
            userAddressRepository.saveAll(user.getAddresses());
        }
        return userRepository.save(user);
    }

    public UserDTO get(Long id) {
        var user = userRepository.findById(id).orElseThrow();
        user.setAddresses(userAddressRepository.findByUserIdAndIsDeletedFalse(user.getId()));
        return user;
    }

    public List<UserDTO> getList() {
        var user = userRepository.findByIsDeletedFalse();
        for (UserDTO userDTO : user) {
            var address = userAddressRepository.findByUserIdAndIsDeletedFalse(userDTO.getId());
            if (address != null) {
                userDTO.setAddresses(address);
            }
        }
        return user;
    }

    public List<UserDTO> getActiveUserList() {
        var user = userRepository.findByIsDeletedFalseAndIsActiveTrue();
        for (UserDTO userDTO : user) {
            var address = userAddressRepository.findByUserIdAndIsDeletedFalse(userDTO.getId());
            if (address != null) {
                userDTO.setAddresses(address);
            }
        }
        return user;
    }

    @Transactional
    public void delete(Long id) {
        var data = userRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        userRepository.save(data);
        var addressData = userAddressRepository.findByUserId(id);
        for (var address : addressData) {
            address.setIsDeleted(true);
        }
        userAddressRepository.saveAll(addressData);
    }

    public List<UserAddressDTO> getAddressListByUserId(Long userId) {
        return userAddressRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    public UserAddressDTO getAddress(Long id) {
        return userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User Address not found with ID: " + id));
    }

    @Transactional
    public UserAddressDTO saveAddress(UserAddressDTO address) {
        if (address.getIsDeleted() == null) {
            address.setIsDeleted(false);
        }
        if (address.getIsActive() == null) {
            address.setIsActive(true);
        }
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<UserAddressDTO> others = userAddressRepository.findByUserIdAndIsDeletedFalse(address.getUserId());
            for (UserAddressDTO other : others) {
                if ((address.getId() == null || !other.getId().equals(address.getId())) && Boolean.TRUE.equals(other.getIsDefault())) {
                    other.setIsDefault(false);
                    userAddressRepository.save(other);
                }
            }
        }
        return userAddressRepository.save(address);
    }

    @Transactional
    public Auditable deleteAddress(Long id) {
        UserAddressDTO address = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User Address not found with ID: " + id));
        address.setIsDeleted(true);
         return userAddressRepository.save(address);
    }
}
