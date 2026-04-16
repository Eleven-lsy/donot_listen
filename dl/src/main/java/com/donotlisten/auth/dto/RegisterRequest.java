package com.donotlisten.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 注册请求体。
 * 首版注册只保留用户名、邮箱和密码三个必要字段，其他资料由系统补默认值。
 */
public record RegisterRequest(
        @NotBlank(message = "不能为空") @Size(min = 3, max = 50, message = "长度需在 3 到 50 之间") String username,
        @NotBlank(message = "不能为空") @Email(message = "邮箱格式不正确") String email,
        @NotBlank(message = "不能为空") @Size(min = 6, max = 100, message = "长度需在 6 到 100 之间") String password
) {
}
