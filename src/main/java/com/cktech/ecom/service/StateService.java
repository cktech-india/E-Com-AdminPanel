package com.cktech.ecom.service;

import com.cktech.ecom.model.state.StateDTO;
import com.cktech.ecom.repository.StateRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StateService {

    private final StateRepository stateRepository;

    public StateService(StateRepository stateRepository) {
        this.stateRepository = stateRepository;
    }

    public StateDTO save(StateDTO state) {

        return stateRepository.save(state);

    }

    public StateDTO get(Long id) {

        return stateRepository.findById(id).orElseThrow();

    }

    public List<StateDTO> getList() {

        return stateRepository.findByIsDeletedFalse();

    }

    public List<StateDTO> getActiveStateList() {

        return stateRepository.findByIsDeletedFalseAndIsActiveTrue();

    }

    @Transactional
    public void delete(Long id) {

        var data = stateRepository.findById(id).orElseThrow();

        data.setIsDeleted(true);

        stateRepository.save(data);

    }
}