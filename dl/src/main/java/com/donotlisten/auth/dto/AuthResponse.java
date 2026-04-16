package com.donotlisten.auth.dto;

/**
 * 认证结果响应。
 * 用于向前端返回登录或注册成功后的用户基础信息和 Bearer Token。
 */
public record AuthResponse(
        String userId,
        String username,
        String email,
        String token,
        String avatar,
        Integer level,
        Integer totalListening,
        Integer masteredCount
) {
}
