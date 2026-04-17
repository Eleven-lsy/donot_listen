package com.donotlisten.user.assembler;

import com.donotlisten.user.User;
import com.donotlisten.user.dto.UserProfileResponse;
import org.springframework.stereotype.Component;

/**
 * 用户资料响应组装器。
 * 负责将用户实体和聚合统计结果转换为个人资料响应对象。
 */
@Component
public class UserProfileAssembler {

    public UserProfileResponse toResponse(User user, int totalListeningTime, int familiarCount, int unfamiliarCount) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatar(),
                user.getLevel(),
                user.getTotalListening(),
                totalListeningTime,
                user.getMasteredCount(),
                familiarCount,
                unfamiliarCount,
                user.getCurrentStreak(),
                user.getLongestStreak(),
                user.getJoinDate(),
                user.getLastActiveAt()
        );
    }
}
