package com.donotlisten.user.dto;

import java.time.LocalDateTime;

/**
 * 用户资料响应。
 * 用于承载个人中心所需的基础资料和学习统计字段。
 */
public record UserProfileResponse(
        String userId,
        String username,
        String email,
        String avatar,
        Integer level,
        Integer totalListening,
        Integer totalListeningTime,
        Integer masteredCount,
        Integer familiarCount,
        Integer unfamiliarCount,
        Integer currentStreak,
        Integer longestStreak,
        LocalDateTime joinDate,
        LocalDateTime lastActiveAt
) {
}
