package com.donotlisten.listening.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 听力详情响应。
 * 用于承载播放器详情页需要的主表字段、收藏状态和用户学习进度。
 */
public record ListeningDetailResponse(
        String id,
        String title,
        Integer year,
        Integer month,
        Integer setNumber,
        Integer level,
        String type,
        Integer duration,
        Integer difficulty,
        String coverImage,
        String audioUrl,
        List<Object> questions,
        boolean isCollected,
        UserProgressResponse userProgress,
        LocalDateTime createdAt
) {
}
