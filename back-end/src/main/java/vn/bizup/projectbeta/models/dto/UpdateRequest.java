package vn.bizup.projectbeta.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.bizup.projectbeta.models.entities.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRequest {
    private String phone;
    private String password;
    private Role role;
}
