package com.donotlisten.record.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningStatisticsResponse {

    private Long totalListeningTime;
    private Integer totalUnderstood;
    private Integer totalFamiliar;
    private Integer totalUnfamiliar;
    private Integer currentStreak;
    private Integer longestStreak;
}
