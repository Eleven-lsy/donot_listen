package com.donotlisten.record.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningRecordDetailResponse {

    private String id;
    private String listeningId;
    private String listeningTitle;
    private Integer duration;
    private Integer progress;
    private Integer understood;
    private Integer familiar;
    private Integer unfamiliar;
    private LocalDateTime lastPractice;
}
