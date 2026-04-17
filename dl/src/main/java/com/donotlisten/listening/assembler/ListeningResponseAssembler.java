package com.donotlisten.listening.assembler;

import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.listening.TranscriptLine;
import com.donotlisten.listening.UserListeningProgress;
import com.donotlisten.listening.dto.ListeningDetailResponse;
import com.donotlisten.listening.dto.TranscriptLineResponse;
import com.donotlisten.listening.dto.TranscriptResponse;
import com.donotlisten.listening.dto.UserProgressResponse;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 听力响应组装器。
 * 负责将听力主表、原文和进度实体转换为播放器接口返回结构。
 */
@Component
public class ListeningResponseAssembler {

    public ListeningDetailResponse toDetailResponse(
            ListeningMaterial material,
            boolean isCollected,
            UserListeningProgress progress
    ) {
        return new ListeningDetailResponse(
                material.getId(),
                material.getTitle(),
                material.getYear(),
                material.getMonth(),
                material.getSetNumber(),
                material.getLevel(),
                material.getType().value(),
                material.getDuration(),
                material.getDifficulty(),
                material.getCoverImage(),
                material.getAudioUrl(),
                List.of(),
                isCollected,
                new UserProgressResponse(
                        progress.getProgress(),
                        progress.getUnderstoodCount(),
                        progress.getFamiliarCount(),
                        progress.getUnfamiliarCount(),
                        progress.getLastPosition(),
                        progress.getDuration()
                ),
                material.getCreatedAt()
        );
    }

    public TranscriptResponse toTranscriptResponse(String listeningId, List<TranscriptLine> lines) {
        return new TranscriptResponse(
                listeningId,
                lines.stream().map(this::toTranscriptLineResponse).toList()
        );
    }

    private TranscriptLineResponse toTranscriptLineResponse(TranscriptLine line) {
        return new TranscriptLineResponse(
                line.getId(),
                line.getLineNumber(),
                line.getSpeaker(),
                line.getContent(),
                line.getStartTime(),
                line.getEndTime()
        );
    }
}
