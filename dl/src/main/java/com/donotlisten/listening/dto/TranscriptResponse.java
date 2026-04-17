package com.donotlisten.listening.dto;

import java.util.List;

/**
 * 原文响应。
 * 用于封装某篇听力的完整逐句原文列表。
 */
public record TranscriptResponse(
        String listeningId,
        List<TranscriptLineResponse> lines
) {
}
