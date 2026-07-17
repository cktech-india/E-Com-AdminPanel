package com.cktech.ecom.model.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterDTO {
    private int pageIndex;
    private int pageSize = 10;
    private String sortColumn = "id";
    private String sortDirection = "ASC";
    private String searchValue;
}
