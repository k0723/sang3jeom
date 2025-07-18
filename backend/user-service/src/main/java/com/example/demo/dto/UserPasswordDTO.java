package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.example.demo.domain.UserEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPasswordDTO {
    @NotBlank(message = "새로운 비밀번호를 입력해주세요")
    private String new_password;

    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;

    public static UserPasswordDTO userPasswordChange(UserEntity u) {
        return UserPasswordDTO.builder()
                        .password()
                         .build();
    }
}
