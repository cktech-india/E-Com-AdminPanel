package com.cktech.ecom.model.user;
import com.cktech.ecom.common.AppEnum;
import com.cktech.ecom.model.dto.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "users_t")
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_code", nullable = false, length = 5)
    private String companyCode;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    private AppEnum.USER_TYPE userType;

    @Column(name = "state_code", length = 50)
    private String stateCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Transient
    private List<UserAddressDTO> addresses;
}