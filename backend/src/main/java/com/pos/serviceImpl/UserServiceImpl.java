package com.pos.serviceImpl;

import com.pos.dto.AuthRequest;
import com.pos.dto.AuthResponse;
import com.pos.dto.UserDTO;
import com.pos.exception.ResourceNotFoundException;
import com.pos.mapper.UserMapper;
import com.pos.model.Role;
import com.pos.model.User;
import com.pos.repository.UserRepository;
import com.pos.security.JwtUtil;
import com.pos.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository      userRepository;
    private final PasswordEncoder     passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil             jwtUtil;
    private final UserMapper          userMapper;

    // ── Registration ─────────────────────────────────────────────────────
    @Override
    public AuthResponse register(AuthRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username '" + req.getUsername() + "' is already taken.");
        }

        // Validate email — required for OTP password reset
        String email = req.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address is required for registration.");
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Please provide a valid email address.");
        }
        if (userRepository.existsByEmail(email.toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Prevent self-assigning ADMIN role through the public registration form
        Role role = (req.getRole() != null && req.getRole() != Role.ADMIN)
                ? req.getRole() : Role.CASHIER;

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .email(req.getEmail())
                .approved(false)   // must be approved by admin
                .build();

        userRepository.save(user);
        log.info("New registration pending approval: {} (role={})", user.getUsername(), role);

        // Return a special "pending" response — no JWT yet
        return AuthResponse.builder()
                .username(user.getUsername())
                .role(user.getRole())
                .pending(true)
                .message("Registration submitted. Waiting for admin approval.")
                .build();
    }

    // ── Login ────────────────────────────────────────────────────────────
    @Override
    public AuthResponse login(AuthRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
            User user = (User) auth.getPrincipal();
            String token = jwtUtil.generateToken(user);
            return AuthResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .role(user.getRole())
                    .tokenType("Bearer")
                    .build();
        } catch (DisabledException ex) {
            // Check if rejected or just pending
            userRepository.findByUsername(req.getUsername()).ifPresent(u -> {
                if (u.getRejectionReason() != null) {
                    throw new IllegalStateException("Account rejected: " + u.getRejectionReason());
                }
            });
            throw new IllegalStateException("Your account is pending admin approval. Please wait.");
        } catch (BadCredentialsException ex) {
            throw new IllegalArgumentException("Invalid username or password.");
        } catch (AuthenticationException ex) {
            throw new IllegalArgumentException(ex.getMessage());
        }
    }

    // ── Admin: list pending users ─────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getPendingUsers() {
        return userRepository.findByApprovedFalseAndRejectionReasonIsNull()
                .stream().map(userMapper::toDTO).toList();
    }

    // ── Admin: approve ────────────────────────────────────────────────────
    @Override
    public UserDTO approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setApproved(true);
        user.setApprovedAt(LocalDateTime.now());
        user.setRejectionReason(null);
        userRepository.save(user);
        log.info("User approved: {} by admin", user.getUsername());
        return userMapper.toDTO(user);
    }

    // ── Admin: reject ─────────────────────────────────────────────────────
    @Override
    public void rejectUser(Long id, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setApproved(false);
        user.setRejectionReason(reason != null ? reason : "Rejected by admin");
        userRepository.save(user);
        log.info("User rejected: {} — reason: {}", user.getUsername(), user.getRejectionReason());
    }

    // ── Get by ID ─────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userMapper.toDTO(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }
}
