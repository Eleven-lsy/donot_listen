package com.donotlisten.auth.assembler;

import com.donotlisten.auth.dto.AuthResponse;
import com.donotlisten.auth.jwt.TokenService;
import com.donotlisten.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 认证响应组装器。
 * 负责将用户实体转换成登录和注册接口需要的响应对象。
 */
@Component
@RequiredArgsConstructor
public class AuthResponseAssembler {

    private final TokenService tokenService;

    public AuthResponse toResponse(User user) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                tokenService.createToken(user.getId()),
                user.getAvatar(),
                user.getLevel(),
                user.getTotalListening(),
                user.getMasteredCount()
        );
    }
}
