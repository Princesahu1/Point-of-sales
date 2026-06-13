package com.pos.repository;

import com.pos.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findTopByEmailAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String email, LocalDateTime now);

    @Modifying
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email")
    void invalidateAllForEmail(String email);
}
