package com.donotlisten.auth.service;

import com.donotlisten.auth.dto.AuthResponse;
import com.donotlisten.auth.dto.LoginRequest;
import com.donotlisten.auth.dto.RegisterRequest;
import com.donotlisten.user.User;

/**
 * 认证服务接口。
 * 定义注册、登录和当前用户解析能力。
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    User getAuthenticatedUser(String authorizationHeader);
}
