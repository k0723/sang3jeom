package com.example.demo.client;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.cloud.openfeign.FeignClient;

import com.example.demo.dto.UserDTO;

@FeignClient(name = "userClient", url = "${services.user.url}")
public interface UserClient {
    @GetMapping("/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}