package com.cktech.ecom.model.state;

import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "states_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class StateDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "state_code", nullable = false, length = 5)
    private String stateCode;

    @Column(name = "state_name", nullable = false, length = 100)
    private String stateName;

    @Column(name = "gst_state_code", length = 5)
    private String gstStateCode;
}