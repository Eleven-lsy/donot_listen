package com.donotlisten.user.controller;

import com.donotlisten.common.ApiResponse;
import com.donotlisten.user.dto.UserProfileResponse;
import com.donotlisten.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户控制器。
 * 当前只保留个人资料读取接口。
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 获取当前登录用户资料。
     *
     * @param authorizationHeader Bearer Token
     * @return 个人资料
     */
    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile(@RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.success(userService.getProfile(authorizationHeader));
    }
}
