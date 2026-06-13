package com.pos.serviceImpl;

import com.pos.model.OtpToken;
import com.pos.model.User;
import com.pos.repository.OtpRepository;
import com.pos.repository.UserRepository;
import com.pos.service.OtpService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpRepository   otpRepository;
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender  mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.otp-expiry-minutes:10}")
    private int otpExpiryMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String sendOtp(String email) {
        userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found with email: " + email));

        otpRepository.invalidateAllForEmail(email.toLowerCase().trim());

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        otpRepository.save(OtpToken.builder()
                .email(email.toLowerCase().trim())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .build());

        try {
            sendOtpEmail(email, otp);
            log.info("✅ OTP email sent to {}", email);
        } catch (Exception ex) {
            log.error("❌ Failed to send OTP to {}: {}", email, ex.getMessage());
            throw new RuntimeException("Could not send OTP email: " + ex.getMessage());
        }
        return otp;
    }

    private void sendOtpEmail(String toEmail, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(toEmail);
        helper.setSubject("🔐 Your POS System OTP — " + otp);
        String html = """
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                        background:#1a1d2e;border-radius:16px;color:#e2e8f0">
              <h2 style="color:#3b82f6">⚡ POS System Password Reset</h2>
              <p>Use the OTP below to reset your password.</p>
              <div style="font-size:36px;font-weight:800;letter-spacing:10px;
                          background:#0f1117;border:2px solid #3b82f6;
                          padding:20px;border-radius:10px;text-align:center;
                          color:#3b82f6;margin:20px 0">%s</div>
              <p style="color:#9ca3af;font-size:13px">
                Valid for <strong style="color:#f59e0b">%d minutes</strong>.
                Never share this OTP.
              </p>
            </div>
            """.formatted(otp, otpExpiryMinutes);
        helper.setText(html, true);
        mailSender.send(message);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyOtp(String email, String otp) {
        Optional<OtpToken> token = otpRepository
                .findTopByEmailAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        email.toLowerCase().trim(), LocalDateTime.now());
        return token.map(t -> t.getOtp().equals(otp)).orElse(false);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.toLowerCase().trim();
        OtpToken token = otpRepository
                .findTopByEmailAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        normalizedEmail, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("OTP is invalid or has expired."));

        if (!token.getOtp().equals(otp))
            throw new IllegalArgumentException("Incorrect OTP. Please try again.");

        token.setUsed(true);
        otpRepository.save(token);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("✅ Password reset for: {}", normalizedEmail);
    }
}