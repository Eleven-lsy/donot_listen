package com.donotlisten.listening.controller;

import com.donotlisten.common.ApiResponse;
import com.donotlisten.listening.dto.ListeningDetailResponse;
import com.donotlisten.listening.dto.ListeningListResponse;
import com.donotlisten.listening.dto.TranscriptResponse;
import com.donotlisten.listening.service.ListeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 听力控制器。
 * 当前只保留播放器页联调所需的详情和原文接口。
 */
@RestController
@RequestMapping("/api/listening")
@RequiredArgsConstructor
public class ListeningController {

    private final ListeningService listeningService;

    /**
     * 获取听力列表。
     */
    @GetMapping("/list")
    public ApiResponse<ListeningListResponse> getList(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer level,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize
    ) {
        return ApiResponse.success(listeningService.getList(authorizationHeader, year, level, type, page, pageSize));
    }

    /**
     * 获取某篇听力详情。
     */
    @GetMapping("/detail/{id}")
    public ApiResponse<ListeningDetailResponse> getDetail(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String id
    ) {
        return ApiResponse.success(listeningService.getDetail(authorizationHeader, id));
    }

    /**
     * 获取某篇听力的逐句原文。
     */
    @GetMapping("/transcript/{id}")
    public ApiResponse<TranscriptResponse> getTranscript(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String id
    ) {
        return ApiResponse.success(listeningService.getTranscript(authorizationHeader, id));
    }

    /**
     * 获取某套听力的所有题目。
     */
    @GetMapping("/set")
    public ApiResponse<List<ListeningListResponse.ListeningItem>> getListeningSet(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer level,
            @RequestParam(required = false) Integer setNumber,
            @RequestParam(required = false) String type
    ) {
        return ApiResponse.success(listeningService.getListeningSet(authorizationHeader, year, month, level, setNumber, type));
    }
}
