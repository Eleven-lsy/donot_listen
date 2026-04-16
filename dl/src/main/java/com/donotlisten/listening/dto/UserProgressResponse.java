package com.donotlisten.listening.dto;

/**
 * 用户篇章进度响应。
 * 用于描述当前用户在某篇听力下的进度百分比、句子状态数量和上次学习位置。
 */
public record UserProgressResponse(
        int progress,
        int understood,
        int familiar,
        int unfamiliar,
        int lastPosition,
        int duration
) {
}
