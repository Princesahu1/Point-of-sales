package com.pos.service;

import com.pos.dto.AuthRequest;
import com.pos.dto.AuthResponse;
import com.pos.dto.UserDTO;

import java.util.List;

public interface UserService {
    AuthResponse register(AuthRequest authRequest);
    AuthResponse login(AuthRequest authRequest);
    UserDTO      getUserById(Long id);
    List<UserDTO> getPendingUsers();
    UserDTO      approveUser(Long id);
    void         rejectUser(Long id, String reason);
}
