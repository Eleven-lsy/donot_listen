package com.donotlisten.navigation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavigationResponse {
    
    private List<YearSection> years;
    private List<SpecialSection> special;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearSection {
        private String title;
        private String id;
        private List<MonthSection> months;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthSection {
        private String title;
        private List<ListeningItem> cet4;
        private List<ListeningItem> cet6;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListeningItem {
        private String id;
        private String label;
        private String type;
        private Integer setNumber;
        private Integer year;
        private Integer month;
        private Integer level;
        private List<ListeningItem> items;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecialSection {
        private String title;
        private String id;
        private List<ListeningItem> items;
    }
}
