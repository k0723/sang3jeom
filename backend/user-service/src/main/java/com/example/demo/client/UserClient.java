package com.example.demo.client;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "userClient", url = "${services.user.url}", configuration = FeignConfig.class, fallback = UserClientFallback.class)
public interface UserClient {
    @GetMapping("/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}