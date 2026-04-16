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
public class CollectionWithMaterial {

    private String id;
    private String userId;
    private String listeningId;
    private LocalDateTime createdAt;
    private String listeningTitle;
    private String coverImage;
    private Integer level;
    private Integer duration;
}
