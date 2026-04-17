package com.donotlisten.auth.service.impl;

import com.donotlisten.auth.assembler.AuthResponseAssembler;
import com.donotlisten.auth.dto.AuthResponse;
import com.donotlisten.auth.dto.LoginRequest;
import com.donotlisten.auth.dto.RegisterRequest;
import com.donotlisten.auth.jwt.TokenService;
import com.donotlisten.auth.service.AuthService;
import com.donotlisten.common.exception.ApiException;
import com.donotlisten.common.support.EntityLifecycleHelper;
import com.donotlisten.user.User;
import com.donotlisten.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 认证服务实现。
 * 只负责注册、登录和 Bearer Token 解析等业务编排，响应组装交给 assembler，持久化填充交给基础辅助组件。
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuthResponseAssembler authResponseAssembler;
    private final EntityLifecycleHelper entityLifecycleHelper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userMapper.existsByUsernameIgnoreCase(username)) {
            throw new ApiException(HttpStatus.CONFLICT, 409, "用户名已存在");
        }
        if (userMapper.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, 409, "邮箱已存在");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .avatar("https://placehold.co/128x128/png?text=DL")
                .level(1)
                .build();
        user.touchLastActive();
        entityLifecycleHelper.prepareForInsert(user);
        userMapper.insert(user);

        return authResponseAssembler.toResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String principal = request.username().trim();
        User user = userMapper.findByUsernameOrEmail(principal)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, 401, "用户名或密码错误"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, 401, "用户名或密码错误");
        }

        user.touchLastActive();
        entityLifecycleHelper.prepareForUpdate(user);
        userMapper.updateActivityAndStats(user);
        return authResponseAssembler.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getAuthenticatedUser(String authorizationHeader) {
        String token = resolveBearerToken(authorizationHeader);
        String userId = tokenService.parseUserId(token);
        return userMapper.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, 401, "登录已过期，请重新登录"));
    }

    private String resolveBearerToken(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, 401, "缺少有效的登录凭证");
        }
        String token = authorizationHeader.substring(7).trim();
        if (!StringUtils.hasText(token)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, 401, "缺少有效的登录凭证");
        }
        return token;
    }
}
