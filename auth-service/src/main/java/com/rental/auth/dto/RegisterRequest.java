package com.rental.auth.dto;

import com.rental.auth.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private User.Role role;
}
