package com.example.demo.repository;

import com.example.demo.domain.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    
    Optional<EmailVerification> findByEmail(String email);
    
    Optional<EmailVerification> findByEmailAndVerificationCode(String email, String verificationCode);
    
    @Modifying
    @Query("DELETE FROM EmailVerification e WHERE e.expiresAt < :now")
    void deleteExpiredVerifications(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE EmailVerification e SET e.verified = true WHERE e.email = :email")
    void markAsVerified(@Param("email") String email);
    
    boolean existsByEmailAndVerifiedTrue(String email);
} 