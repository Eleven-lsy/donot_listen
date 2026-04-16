package com.donotlisten.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 应用基础配置。
 * 当前主要负责注册密码加密器，供注册和登录校验复用。
 */
@Configuration
public class AppConfig {

    /**
     * 注册密码加密器。
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
