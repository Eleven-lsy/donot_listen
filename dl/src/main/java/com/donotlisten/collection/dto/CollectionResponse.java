package com.donotlisten.collection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponse {

    private String id;
    private String listeningId;
    private String listeningTitle;
    private String coverImage;
    private Integer level;
    private Integer duration;
    private LocalDateTime collectedAt;
}
