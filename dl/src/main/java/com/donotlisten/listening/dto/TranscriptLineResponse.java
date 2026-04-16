package com.donotlisten.listening.dto;

/**
 * 单行原文响应。
 * 表示播放器逐句模式下的一条句子及其时间区间。
 */
public record TranscriptLineResponse(
        String id,
        Integer number,
        String speaker,
        String text,
        Double startTime,
        Double endTime
) {
}
