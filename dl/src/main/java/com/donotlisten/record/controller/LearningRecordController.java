package com.donotlisten.record.controller;

import com.donotlisten.auth.jwt.TokenService;
import com.donotlisten.common.ApiResponse;
import com.donotlisten.record.dto.FeedbackRequest;
import com.donotlisten.record.dto.LearningRecordListResponse;
import com.donotlisten.record.service.LearningRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LearningRecordController {

    private final LearningRecordService learningRecordService;
    private final TokenService tokenService;

    @GetMapping("/user/learning-records")
    public ApiResponse<LearningRecordListResponse> getLearningRecords(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize
    ) {
        String userId = tokenService.parseUserId(authorizationHeader);
        return ApiResponse.success(learningRecordService.getLearningRecords(userId, page, pageSize));
    }

    @PostMapping("/listening/feedback")
    public ApiResponse<Void> submitFeedback(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody FeedbackRequest request
    ) {
        String userId = tokenService.parseUserId(authorizationHeader);
        learningRecordService.submitFeedback(userId, request);
        return ApiResponse.success("反馈提交成功", null);
    }

    @DeleteMapping("/user/learning-records")
    public ApiResponse<Void> deleteAllRecords(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        String userId = tokenService.parseUserId(authorizationHeader);
        learningRecordService.deleteAllRecords(userId);
        return ApiResponse.success("学习记录已清空", null);
    }
}
