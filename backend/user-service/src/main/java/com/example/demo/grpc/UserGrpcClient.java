
package com.example.demo.grpc;

import com.example.demo.grpc.*;
import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Component;

@Component
public class UserGrpcClient {

    private final UserServiceGrpc.UserServiceBlockingStub stub;

    public UserGrpcClient() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress("user-service", 9090) // 내부 DNS 혹은 localhost
                .usePlaintext()
                .build();

        stub = UserServiceGrpc.newBlockingStub(channel);
    }

    public UserInfo getUserById(long userId) {
        return stub.getUserById(UserIdRequest.newBuilder().setUserId(userId).build());
    }

    public void listUsers() {
        UserListResponse res = stub.listUsers(Empty.newBuilder().build());
        res.getUsersList().forEach(u -> System.out.println(u.getEmail()));
    }
}
