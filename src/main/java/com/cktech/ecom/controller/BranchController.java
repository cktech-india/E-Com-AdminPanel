package com.cktech.ecom.controller;

import com.cktech.ecom.model.branch.BranchDTO;
import com.cktech.ecom.service.BranchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @PostMapping("")
    public ResponseEntity<BranchDTO> save(@RequestBody BranchDTO branch) {
        return ResponseEntity.ok(branchService.save(branch));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<BranchDTO>> getList() {
        return ResponseEntity.ok(branchService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<BranchDTO>> getActiveList() {
        return ResponseEntity.ok(branchService.getActiveBranchList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        branchService.delete(id);
        return ResponseEntity.ok("Branch deleted successfully");
    }
}