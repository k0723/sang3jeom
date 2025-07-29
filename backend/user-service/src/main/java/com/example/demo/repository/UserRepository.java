package com.example.demo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.domain.UserEntity;     
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByProviderAndProviderId(String provider, String providerId);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
