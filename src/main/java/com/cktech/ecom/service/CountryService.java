package com.cktech.ecom.service;

import com.cktech.ecom.model.country.CountryDTO;
import com.cktech.ecom.repository.CountryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CountryService {

    private final CountryRepository countryRepository;

    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    public CountryDTO save(CountryDTO country) {
        return countryRepository.save(country);
    }

    public CountryDTO get(Long id) {
        return countryRepository.findById(id).orElseThrow();
    }

    public List<CountryDTO> getList() {
        return countryRepository.findByIsDeletedFalse();
    }

    public List<CountryDTO> getActiveCountryList() {
        return countryRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = countryRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        countryRepository.save(data);
    }
}
