package com.example.review.client;

import com.example.review.dto.client.UserInfoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// name: 유레카 등 서비스 디스커버리에 등록된 서비스 이름
// url: 로컬 테스트 시 application-local.yml에 설정한 값
@FeignClient(name = "user-service", url = "${service-urls.user-service}")
public interface UserServiceClient {

    /**
     * user-service에 ID로 사용자를 조회하는 API.
     * @param userId 조회할 사용자의 ID
     * @return 사용자가 존재하면 ResponseEntity<UserInfoDTO>, 없으면 404 예외 발생
     */
    @GetMapping("/users/{id}")
    ResponseEntity<UserInfoDTO> getUserById(@PathVariable("id") Long userId);
}