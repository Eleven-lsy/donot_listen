package com.donotlisten.collection.controller;

import com.donotlisten.auth.jwt.TokenService;
import com.donotlisten.collection.dto.CollectionListResponse;
import com.donotlisten.collection.dto.CollectionRequest;
import com.donotlisten.collection.dto.CollectionResponse;
import com.donotlisten.collection.service.CollectionService;
import com.donotlisten.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final TokenService tokenService;

    @GetMapping
    public ApiResponse<CollectionListResponse> getCollections(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize
    ) {
        String userId = tokenService.parseUserId(authorizationHeader);
        return ApiResponse.success(collectionService.getCollections(userId, page, pageSize));
    }

    @PostMapping
    public ApiResponse<CollectionResponse> addCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody CollectionRequest request
    ) {
        String userId = tokenService.parseUserId(authorizationHeader);
        return ApiResponse.success("收藏成功", collectionService.addCollection(userId, request));
    }

    @DeleteMapping("/{listeningId}")
    public ApiResponse<Void> deleteCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String listeningId
    ) {
        String userId = tokenService.parseUserId(authorizationHeader);
        collectionService.deleteCollection(userId, listeningId);
        return ApiResponse.success("取消收藏成功", null);
    }
}
