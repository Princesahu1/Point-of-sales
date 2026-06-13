package com.pos.dto;

import com.pos.model.Role;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String  token;
    private String  username;
    private Role    role;
    @Builder.Default
    private String  tokenType = "Bearer";
    /** True when registration is pending admin approval (no token) */
    @Builder.Default
    private boolean pending = false;
    private String  message;
}
