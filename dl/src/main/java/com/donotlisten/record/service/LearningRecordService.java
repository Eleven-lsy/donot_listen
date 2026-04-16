package com.donotlisten.record.service;

import com.donotlisten.listening.FeedbackStatus;
import com.donotlisten.listening.ListeningFeedback;
import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.listening.UserListeningProgress;
import com.donotlisten.listening.mapper.ListeningFeedbackMapper;
import com.donotlisten.listening.mapper.ListeningMaterialMapper;
import com.donotlisten.listening.mapper.TranscriptLineMapper;
import com.donotlisten.listening.mapper.UserListeningProgressMapper;
import com.donotlisten.record.dto.*;
import com.donotlisten.record.mapper.LearningRecordMapper;
import com.donotlisten.user.User;
import com.donotlisten.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearningRecordService {

    private final LearningRecordMapper learningRecordMapper;
    private final ListeningFeedbackMapper listeningFeedbackMapper;
    private final UserListeningProgressMapper userListeningProgressMapper;
    private final ListeningMaterialMapper listeningMaterialMapper;
    private final TranscriptLineMapper transcriptLineMapper;
    private final UserMapper userMapper;

    public LearningRecordListResponse getLearningRecords(String userId, Integer page, Integer pageSize) {
        page = page == null || page < 1 ? 1 : page;
        pageSize = pageSize == null || pageSize < 1 ? 20 : pageSize;

        int offset = (page - 1) * pageSize;

        List<LearningRecordDetailResponse> records = learningRecordMapper.findByUserIdPageable(userId, pageSize, offset);
        long total = learningRecordMapper.countByUserId(userId);
        LearningStatisticsResponse statistics = learningRecordMapper.findStatisticsByUserId(userId);

        User user = userMapper.findById(userId).orElse(null);
        if (user != null) {
            statistics.setCurrentStreak(user.getCurrentStreak());
            statistics.setLongestStreak(user.getLongestStreak());
        }

        return LearningRecordListResponse.builder()
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .statistics(statistics)
                .records(records)
                .build();
    }

    @Transactional
    public void submitFeedback(String userId, FeedbackRequest request) {
        User user = userMapper.findById(userId)
                .orElseThrow(() -> new com.donotlisten.common.exception.ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "用户不存在"));
        ListeningMaterial material = listeningMaterialMapper.findById(request.getListeningId())
                .orElseThrow(() -> new com.donotlisten.common.exception.ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "听力素材不存在"));

        ListeningFeedback feedback = ListeningFeedback.builder()
                .user(user)
                .listening(material)
                .lineNumber(request.getLineNumber())
                .status(request.getStatus())
                .updatedAt(LocalDateTime.now())
                .build();

        Optional<ListeningFeedback> existingFeedback = listeningFeedbackMapper
                .findByUserIdAndListeningIdAndLineNumber(userId, request.getListeningId(), request.getLineNumber());

        if (existingFeedback.isPresent()) {
            feedback.setId(existingFeedback.get().getId());
            listeningFeedbackMapper.update(feedback);
        } else {
            feedback.setId(UUID.randomUUID().toString());
            listeningFeedbackMapper.insert(feedback);
        }

        updateProgressFromFeedback(userId, request.getListeningId());
    }

    @Transactional
    public void deleteAllRecords(String userId) {
        learningRecordMapper.deleteByUserId(userId);
    }

    private void updateProgressFromFeedback(String userId, String listeningId) {
        List<ListeningFeedback> feedbackList = listeningFeedbackMapper.findByUserIdAndListeningId(userId, listeningId);
        ListeningMaterial material = listeningMaterialMapper.findById(listeningId)
                .orElseThrow(() -> new com.donotlisten.common.exception.ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "听力素材不存在"));

        int understood = (int) feedbackList.stream()
                .filter(item -> item.getStatus() == FeedbackStatus.UNDERSTOOD)
                .count();
        int familiar = (int) feedbackList.stream()
                .filter(item -> item.getStatus() == FeedbackStatus.FAMILIAR)
                .count();
        int unfamiliar = (int) feedbackList.stream()
                .filter(item -> item.getStatus() == FeedbackStatus.UNFAMILIAR)
                .count();
        int totalLines = transcriptLineMapper.countByListeningId(listeningId);
        int progress = totalLines == 0 ? 0 : (understood + familiar + unfamiliar) * 100 / totalLines;
        int lastPosition = feedbackList.stream()
                .map(ListeningFeedback::getLineNumber)
                .max(Integer::compareTo)
                .orElse(0);

        LocalDateTime now = LocalDateTime.now();

        Optional<UserListeningProgress> existingProgress = userListeningProgressMapper
                .findByUserIdAndListeningId(userId, listeningId);

        if (existingProgress.isPresent()) {
            UserListeningProgress progressEntity = existingProgress.get();
            progressEntity.setDuration(material.getDuration());
            progressEntity.setProgress(progress);
            progressEntity.setUnderstoodCount(understood);
            progressEntity.setFamiliarCount(familiar);
            progressEntity.setUnfamiliarCount(unfamiliar);
            progressEntity.setLastPosition(lastPosition);
            progressEntity.setUpdatedAt(now);
            userListeningProgressMapper.update(progressEntity);
        } else {
            User user = userMapper.findById(userId)
                    .orElseThrow(() -> new com.donotlisten.common.exception.ApiException(
                            org.springframework.http.HttpStatus.NOT_FOUND, "用户不存在"));
            UserListeningProgress progressEntity = UserListeningProgress.builder()
                    .id(UUID.randomUUID().toString())
                    .user(user)
                    .listening(material)
                    .duration(material.getDuration())
                    .progress(progress)
                    .understoodCount(understood)
                    .familiarCount(familiar)
                    .unfamiliarCount(unfamiliar)
                    .lastPosition(lastPosition)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            userListeningProgressMapper.insert(progressEntity);
        }
    }
}
