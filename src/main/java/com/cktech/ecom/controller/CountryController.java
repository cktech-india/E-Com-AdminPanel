package com.cktech.ecom.controller;

import com.cktech.ecom.model.country.CountryDTO;
import com.cktech.ecom.service.CountryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    private final CountryService countryService;

    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    @PostMapping("")
    public ResponseEntity<CountryDTO> save(@RequestBody CountryDTO country) {
        return ResponseEntity.ok(countryService.save(country));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CountryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(countryService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<CountryDTO>> getList() {
        return ResponseEntity.ok(countryService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<CountryDTO>> getActiveList() {
        return ResponseEntity.ok(countryService.getActiveCountryList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        countryService.delete(id);
        return ResponseEntity.ok("Country deleted successfully");
    }
}
