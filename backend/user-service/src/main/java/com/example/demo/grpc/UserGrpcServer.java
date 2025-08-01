package com.example.demo.grpc;

import com.example.demo.dto.UserInfoDTO;
import com.example.demo.service.UserService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class UserGrpcServer extends UserServiceGrpc.UserServiceImplBase {

    private final UserService userService;

    public UserGrpcServer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void getUser(GetUserRequest request, StreamObserver<UserInfoResponse> responseObserver) {

        Long userId = request.getUserId();
        UserInfoDTO dto = userService.findById(userId);

        UserInfoResponse response = UserInfoResponse.newBuilder()
                .setId(dto.getId())
                .setUsername(dto.getUsername())
                .setRole(dto.getRole())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
