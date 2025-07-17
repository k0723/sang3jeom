package com.example.demo.dto;

import com.example.demo.domain.UserEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 회원 가입 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateRequestDTO {

    @NotBlank(message = "사용자 이름을 입력해주세요")
    private String username;

    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "유효한 이메일 형식이어야 합니다")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;

    @NotBlank(message = "비밀번호를 입력해주세요")
    private String confirmPassword;

    @NotBlank(message = "전화번호를 입력해주세요")
    private String phone;

    /**
     * 이 DTO를 엔티티로 변환합니다.
     * 실제 저장 시엔 서비스 계층에서 password 해싱 로직을 적용하세요.
     */
    public UserEntity toEntity() {
        return UserEntity.builder()
                   .username(this.username)
                   .email(this.email)
                   .passwordHash(this.password)  // 나중에 해시 처리할 원시 비밀번호
                   .roles(false)                 // 기본 권한 설정
                   .name(this.username)          // 닉네임 초기값으로 username 사용
                   .profileImageUrl(null)        // 기본 프로필 없음
                   .phone(this.phone)
                   .build();
    }
}
