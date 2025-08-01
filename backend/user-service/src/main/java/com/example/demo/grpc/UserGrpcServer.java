package com.example.demo.grpc.server;

import com.example.demo.dto.UserInfoDTO;
import com.example.demo.service.UserService;
import com.example.demo.grpc.UserServiceGrpc;
import com.example.demo.grpc.GetUserRequest;
import com.example.demo.grpc.UserInfoResponse;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class UserGrpcServer extends UserServiceGrpc.UserServiceImplBase {

    private final UserService userService;

    public UserGrpcServer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void getUser(GetUserRequest request, StreamObserver<UserInfoResponse> responseObserver) {
        Long userId = request.getUserId();  // proto와 일치

        UserInfoDTO dto = userService.findUserById(userId);

        UserInfoResponse response = UserInfoResponse.newBuilder()
                .setId(dto.getId())
                .setUsername(dto.getUsername()) // DTO 필드 존재해야 함
                .setRole(dto.getRole())         // DTO 필드 존재해야 함
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
