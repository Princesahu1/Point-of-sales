package com.pos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;
}
