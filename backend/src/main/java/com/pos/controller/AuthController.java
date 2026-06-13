package com.pos.controller;

import com.pos.dto.AuthRequest;
import com.pos.dto.AuthResponse;
import com.pos.dto.OtpRequest;
import com.pos.dto.ResetPasswordRequest;
import com.pos.service.OtpService;
import com.pos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final OtpService  otpService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest req) {
        AuthResponse response = userService.register(req);
       HttpStatus status = response.isPending() ? HttpStatus.ACCEPTED : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(userService.login(req));
    }

    /** Step 1 — send OTP to registered email */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody OtpRequest req) {

        String otp   = otpService.sendOtp(req.getEmail());
        String email = req.getEmail();

        // Mask email: e.g. sa***@gmail.com
        int atIdx = email.indexOf('@');
        String masked = atIdx > 2
                ? email.substring(0, 2) + "***" + email.substring(atIdx)
                : email;

        Map<String, Object> result = new HashMap<>();
        result.put("message", "OTP sent to your email. Valid for 10 minutes.");
        result.put("email",   masked);
        // ── DEV MODE only — remove before production ──
        result.put("devOtp", otp);
        return ResponseEntity.ok(result);
    }

    /** Step 2 — verify OTP */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestBody Map<String, String> body) {

        boolean valid = otpService.verifyOtp(body.get("email"), body.get("otp"));
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("valid", false, "message", "Invalid or expired OTP"));
        }
        return ResponseEntity.ok(Map.of("valid", true, "message", "OTP verified successfully"));
    }

    /** Step 3 — reset password */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {

        otpService.resetPassword(req.getEmail(), req.getOtp(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please login."));
    }
}