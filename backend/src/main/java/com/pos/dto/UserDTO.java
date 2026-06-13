package com.pos.dto;

import com.pos.model.Role;
import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
    private Long          id;
    private String        username;
    private Role          role;
    private String        email;
    private boolean       approved;
    private LocalDateTime approvedAt;
    private String        rejectionReason;
    private LocalDateTime createdAt;
}
