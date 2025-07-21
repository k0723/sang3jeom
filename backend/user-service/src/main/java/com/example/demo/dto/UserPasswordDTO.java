package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPasswordDTO {
    @NotBlank(message = "새로운 비밀번호를 입력해주세요")
    private String currentPassword;

    @NotBlank(message = "비밀번호를 입력해주세요")
    private String newPassword;
}
