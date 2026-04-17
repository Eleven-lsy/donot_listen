package com.donotlisten.collection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionListResponse {

    private Long total;
    private Integer page;
    private Integer pageSize;
    private List<CollectionResponse> list;
}
