
package com.example.demo.grpc;
import com.example.demo.grpc.GetUserRequest;
import com.example.demo.grpc.UserInfoResponse;
import com.example.demo.grpc.UserServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Component;

@Component
public class UserGrpcClient {

    private final UserServiceGrpc.UserServiceBlockingStub stub;

    public UserGrpcClient() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress("localhost", 9090) // 실제 gRPC 서버 주소
                .usePlaintext()
                .build();
        this.stub = UserServiceGrpc.newBlockingStub(channel);
    }

    public UserInfoResponse getUserById(long userId) {
        GetUserRequest request = GetUserRequest.newBuilder()
                .setUserId(userId)
                .build();

        return stub.getUser(request);
    }
}
