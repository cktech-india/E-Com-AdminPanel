package com.cktech.ecom.model.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataDTO {
    private Object categoryValue;
    private Object seriesValue;
    private Double dataValue;
}
