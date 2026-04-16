package com.donotlisten.user.service;

import com.donotlisten.user.dto.UserProfileResponse;

/**
 * 用户服务接口。
 * 定义个人资料查询能力。
 */
public interface UserService {

    UserProfileResponse getProfile(String authorizationHeader);
}
