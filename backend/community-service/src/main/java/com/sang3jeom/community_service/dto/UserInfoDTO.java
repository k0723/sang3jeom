package com.sang3jeom.community_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserInfoDTO {
    private String name;
    private String email;
    @JsonProperty("id") // JSON의 "id" 필드를 userId에 매핑
    private Integer userId;
} 