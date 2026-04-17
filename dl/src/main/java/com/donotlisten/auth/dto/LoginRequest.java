package com.donotlisten.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 登录请求体。
 * username 字段既可以传用户名，也可以传邮箱，后端会统一兼容处理。
 */
public record LoginRequest(
        @NotBlank(message = "不能为空") String username,
        @NotBlank(message = "不能为空") String password
) {
}
