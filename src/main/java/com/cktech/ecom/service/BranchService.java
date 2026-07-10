package com.cktech.ecom.service;

import com.cktech.ecom.model.branch.BranchDTO;
import com.cktech.ecom.repository.BranchRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchService(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    public BranchDTO save(BranchDTO branch) {
        return branchRepository.save(branch);
    }

    public BranchDTO get(Long id) {
        return branchRepository.findById(id).orElseThrow();
    }

    public List<BranchDTO> getList() {
        return branchRepository.findByIsDeletedFalse();
    }

    public List<BranchDTO> getActiveBranchList() {
        return branchRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = branchRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        branchRepository.save(data);
    }
}