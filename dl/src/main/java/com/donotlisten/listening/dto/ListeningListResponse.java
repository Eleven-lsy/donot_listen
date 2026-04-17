package com.donotlisten.listening.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListeningListResponse {

    private Long total;
    private Integer page;
    private Integer pageSize;
    private List<ListeningItem> list;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListeningItem {
        private String id;
        private String title;
        private Integer year;
        private Integer month;
        private Integer setNumber;
        private Integer level;
        private String type;
        private Integer duration;
        private Integer difficulty;
        private String coverImage;
        private String audioUrl;
        private Long playCount;
        private BigDecimal masteredRate;
        private Boolean isCollected;
    }
}
