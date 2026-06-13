package com.pos.controller;

import com.pos.dto.UserDTO;
import com.pos.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    /** GET /api/admin/pending-users — list all registrations awaiting approval */
    @GetMapping("/pending-users")
    public ResponseEntity<List<UserDTO>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    /** PUT /api/admin/users/{id}/approve */
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<UserDTO> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    /** PUT /api/admin/users/{id}/reject */
    @PutMapping("/users/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectUser(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "Rejected by admin") : "Rejected by admin";
        userService.rejectUser(id, reason);
        return ResponseEntity.ok(Map.of("message", "User rejected successfully"));
    }
}
