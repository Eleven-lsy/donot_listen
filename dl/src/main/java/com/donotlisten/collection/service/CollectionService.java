package com.donotlisten.collection.service;

import com.donotlisten.collection.dto.CollectionListResponse;
import com.donotlisten.collection.dto.CollectionRequest;
import com.donotlisten.collection.dto.CollectionResponse;
import com.donotlisten.collection.dto.CollectionWithMaterial;
import com.donotlisten.collection.mapper.CollectionMapper;
import com.donotlisten.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionMapper collectionMapper;

    public CollectionListResponse getCollections(String userId, Integer page, Integer pageSize) {
        page = page == null || page < 1 ? 1 : page;
        pageSize = pageSize == null || pageSize < 1 ? 20 : pageSize;

        int offset = (page - 1) * pageSize;

        List<CollectionWithMaterial> materials = collectionMapper.findByUserIdPageable(userId, pageSize, offset);
        long total = collectionMapper.countByUserId(userId);

        List<CollectionResponse> list = materials.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return CollectionListResponse.builder()
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .list(list)
                .build();
    }

    public CollectionResponse addCollection(String userId, CollectionRequest request) {
        if (collectionMapper.existsByUserIdAndListeningId(userId, request.getListeningId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "已收藏");
        }

        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        collectionMapper.insert(id, userId, request.getListeningId(), now);

        CollectionWithMaterial material = collectionMapper.findByUserIdAndListeningId(userId, request.getListeningId())
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "收藏创建失败"));

        return convertToResponse(material);
    }

    public void deleteCollection(String userId, String listeningId) {
        if (!collectionMapper.existsByUserIdAndListeningId(userId, listeningId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "收藏不存在");
        }

        collectionMapper.deleteByUserIdAndListeningId(userId, listeningId);
    }

    private CollectionResponse convertToResponse(CollectionWithMaterial material) {
        return CollectionResponse.builder()
                .id(material.getId())
                .listeningId(material.getListeningId())
                .listeningTitle(material.getListeningTitle())
                .coverImage(material.getCoverImage())
                .level(material.getLevel())
                .duration(material.getDuration())
                .collectedAt(material.getCreatedAt())
                .build();
    }
}
