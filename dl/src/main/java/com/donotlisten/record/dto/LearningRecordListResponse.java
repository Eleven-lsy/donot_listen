package com.donotlisten.record.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningRecordListResponse {

    private Long total;
    private Integer page;
    private Integer pageSize;
    private LearningStatisticsResponse statistics;
    private List<LearningRecordDetailResponse> records;
}
