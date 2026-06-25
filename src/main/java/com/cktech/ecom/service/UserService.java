package com.cktech.ecom.service;

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

    public UserDTO saveUser(UserDTO user) {
        UserDTO savedUser = userRepository.save(user);

        // Save addresses
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {

            for (UserAddressDTO address : user.getAddresses()) {
                address.setUserId(savedUser.getId());
                address.setCompanyCode(savedUser.getCompanyCode()); // optional
            }

            userAddressRepository.saveAll(user.getAddresses());
        }

        return savedUser;
    }

    public UserDTO getByUserId(Long id) {
        var user = userRepository.findById(id).orElseThrow();
        user.setAddresses(userAddressRepository.findByUserId(user.getId()));
        return user;
    }

    public List<UserDTO> getActiveUserList() {
        var user = userRepository.findByIsDeletedFalseAndIsActiveTrue();
        for (UserDTO userDTO : user) {
            var address  = userAddressRepository.findByUserId(userDTO.getId());
            if (address != null) {
                userDTO.setAddresses(address);
            }
        }
        return user;
    }
@Transactional
    public void markAsDeleted(Long id) {
        var data = userRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        userRepository.save(data);
    var addressData = userAddressRepository.findByUserId(id);
    for (var address : addressData) {
        address.setIsDeleted(true);
    }
    userAddressRepository.saveAll(addressData);
    }
}
