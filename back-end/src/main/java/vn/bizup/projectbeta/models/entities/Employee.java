package vn.bizup.projectbeta.models.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer employeeId;
    private String employeeName;
    @Column(unique = true)
    private String phone;
    @Column(length = 1000)
    private String address;
    private boolean deleted;

}
