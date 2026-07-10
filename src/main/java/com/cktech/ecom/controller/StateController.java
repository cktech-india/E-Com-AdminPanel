package com.cktech.ecom.controller;

import com.cktech.ecom.model.state.StateDTO;
import com.cktech.ecom.service.StateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/states")
public class StateController {

    private final StateService stateService;

    public StateController(StateService stateService) {
        this.stateService = stateService;
    }

    @PostMapping("")
    public ResponseEntity<StateDTO> save(@RequestBody StateDTO state) {
        return ResponseEntity.ok(stateService.save(state));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StateDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(stateService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<StateDTO>> getList() {
        return ResponseEntity.ok(stateService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<StateDTO>> getActiveList() {
        return ResponseEntity.ok(stateService.getActiveStateList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        stateService.delete(id);
        return ResponseEntity.ok("State deleted successfully");
    }
}