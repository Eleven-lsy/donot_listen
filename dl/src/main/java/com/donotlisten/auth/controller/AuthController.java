package com.donotlisten.auth.controller;

import com.donotlisten.auth.dto.AuthResponse;
import com.donotlisten.auth.dto.LoginRequest;
import com.donotlisten.auth.dto.RegisterRequest;
import com.donotlisten.auth.service.AuthService;
import com.donotlisten.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证控制器。
 * 对外暴露注册和登录两个鉴权接口。
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 注册新用户。
     *
     * @param request 注册请求体
     * @return 注册结果
     */
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("注册成功", authService.register(request));
    }

    /**
     * 用户登录。
     *
     * @param request 登录请求体
     * @return 登录结果
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("登录成功", authService.login(request));
    }
}
