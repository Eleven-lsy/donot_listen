package com.donotlisten.user.service.impl;

import com.donotlisten.auth.service.AuthService;
import com.donotlisten.listening.UserListeningProgress;
import com.donotlisten.listening.mapper.UserListeningProgressMapper;
import com.donotlisten.user.User;
import com.donotlisten.user.assembler.UserProfileAssembler;
import com.donotlisten.user.dto.UserProfileResponse;
import com.donotlisten.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户服务实现。
 * 只负责聚合个人中心所需统计信息，响应组装由 assembler 负责。
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthService authService;
    private final UserListeningProgressMapper userListeningProgressMapper;
    private final UserProfileAssembler userProfileAssembler;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String authorizationHeader) {
        User user = authService.getAuthenticatedUser(authorizationHeader);
        var progressList = userListeningProgressMapper.findByUserId(user.getId());
        int totalListeningTime = progressList.stream().map(UserListeningProgress::getDuration).mapToInt(Integer::intValue).sum();
        int familiarCount = progressList.stream().map(UserListeningProgress::getFamiliarCount).mapToInt(Integer::intValue).sum();
        int unfamiliarCount = progressList.stream().map(UserListeningProgress::getUnfamiliarCount).mapToInt(Integer::intValue).sum();

        return userProfileAssembler.toResponse(user, totalListeningTime, familiarCount, unfamiliarCount);
    }
}
