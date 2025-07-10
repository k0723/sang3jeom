// src/main/java/com/example/demo/dto/UserCreateRequest.java
package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;  // javax → jakarta
import com.example.demo.domain.User;

public class UserCreateRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String email;

    @NotBlank
    private String password;


    public String getUsername() { return username; }
    public void setUsername(String u) { this.username = u; }

    public String getEmail() { return email; }
    public void setEmail(String e) { this.email = e; }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public User toEntity() {
        User u = new User();
        u.setUsername(this.username);
        u.setEmail(this.email);
        u.setPassword(this.password);
        return u;
    }
}
