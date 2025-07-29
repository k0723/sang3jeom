package com.example.demo.dto;

import com.example.demo.domain.UserEntity;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter        // ← 필드별로 getter를 자동 생성
@Setter 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateDTO {
    private String email;
    private String name;
    private String phone;

    public static UserUpdateDTO userUpdate(UserEntity u) {
        return UserUpdateDTO.builder()
                         .email(u.getEmail())
                         .name(u.getName())
                         .phone(u.getPhone())
                         .build();
    }
    

}
