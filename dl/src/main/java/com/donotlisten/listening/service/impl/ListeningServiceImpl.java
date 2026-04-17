package com.donotlisten.listening.service.impl;

import com.donotlisten.auth.service.AuthService;
import com.donotlisten.collection.mapper.UserCollectionMapper;
import com.donotlisten.common.exception.ApiException;
import com.donotlisten.listening.FeedbackStatus;
import com.donotlisten.listening.ListeningFeedback;
import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.listening.UserListeningProgress;
import com.donotlisten.listening.assembler.ListeningResponseAssembler;
import com.donotlisten.listening.dto.ListeningDetailResponse;
import com.donotlisten.listening.dto.ListeningListResponse;
import com.donotlisten.listening.dto.TranscriptResponse;
import com.donotlisten.listening.mapper.ListeningFeedbackMapper;
import com.donotlisten.listening.mapper.ListeningMaterialMapper;
import com.donotlisten.listening.mapper.TranscriptLineMapper;
import com.donotlisten.listening.mapper.UserListeningProgressMapper;
import com.donotlisten.listening.service.ListeningService;
import com.donotlisten.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 听力服务实现。
 * 只负责查询和计算播放器所需数据，响应对象由 assembler 统一组装。
 */
@Service
@RequiredArgsConstructor
public class ListeningServiceImpl implements ListeningService {

    private final AuthService authService;
    private final ListeningMaterialMapper listeningMaterialMapper;
    private final TranscriptLineMapper transcriptLineMapper;
    private final UserCollectionMapper userCollectionMapper;
    private final ListeningFeedbackMapper listeningFeedbackMapper;
    private final UserListeningProgressMapper userListeningProgressMapper;
    private final ListeningResponseAssembler listeningResponseAssembler;

    @Override
    @Transactional(readOnly = true)
    public ListeningListResponse getList(String authorizationHeader, Integer year, Integer level, String type, Integer page, Integer pageSize) {
        User user = authService.getAuthenticatedUser(authorizationHeader);

        page = page == null || page < 1 ? 1 : page;
        pageSize = pageSize == null || pageSize < 1 ? 20 : pageSize;
        int offset = (page - 1) * pageSize;

        List<ListeningListResponse.ListeningItem> list = listeningMaterialMapper.findListPageable(
                user.getId(), year, level, type, pageSize, offset
        );
        long total = listeningMaterialMapper.countListPageable(year, level, type);

        return ListeningListResponse.builder()
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .list(list)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ListeningDetailResponse getDetail(String authorizationHeader, String listeningId) {
        User user = authService.getAuthenticatedUser(authorizationHeader);
        ListeningMaterial material = getMaterial(listeningId);
        boolean isCollected = userCollectionMapper.existsByUserIdAndListeningId(user.getId(), listeningId);
        UserListeningProgress progress = userListeningProgressMapper.findByUserIdAndListeningId(user.getId(), listeningId)
                .orElseGet(() -> buildProgressFromFeedback(user, material));

        return listeningResponseAssembler.toDetailResponse(material, isCollected, progress);
    }

    @Override
    @Transactional(readOnly = true)
    public TranscriptResponse getTranscript(String authorizationHeader, String listeningId) {
        authService.getAuthenticatedUser(authorizationHeader);
        getMaterial(listeningId);
        return listeningResponseAssembler.toTranscriptResponse(
                listeningId,
                transcriptLineMapper.findByListeningIdOrderByLineNumberAsc(listeningId)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeningListResponse.ListeningItem> getListeningSet(String authorizationHeader, Integer year, Integer month, Integer level, Integer setNumber, String type) {
        authService.getAuthenticatedUser(authorizationHeader);
        return listeningMaterialMapper.findByYearMonthLevelSetNumberAndType(year, month, level, setNumber, type);
    }

    private ListeningMaterial getMaterial(String listeningId) {
        return listeningMaterialMapper.findById(listeningId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, 404, "听力素材不存在"));
    }

    private UserListeningProgress buildProgressFromFeedback(User user, ListeningMaterial material) {
        List<ListeningFeedback> feedbackList = listeningFeedbackMapper.findByUserIdAndListeningId(user.getId(), material.getId());
        int understood = (int) feedbackList.stream().filter(item -> item.getStatus() == FeedbackStatus.UNDERSTOOD).count();
        int familiar = (int) feedbackList.stream().filter(item -> item.getStatus() == FeedbackStatus.FAMILIAR).count();
        int unfamiliar = (int) feedbackList.stream().filter(item -> item.getStatus() == FeedbackStatus.UNFAMILIAR).count();
        int totalLines = transcriptLineMapper.countByListeningId(material.getId());
        int progress = totalLines == 0 ? 0 : (understood + familiar + unfamiliar) * 100 / totalLines;
        int lastPosition = feedbackList.stream().map(ListeningFeedback::getLineNumber).max(Integer::compareTo).orElse(0);

        return UserListeningProgress.builder()
                .user(user)
                .listening(material)
                .duration(0)
                .progress(progress)
                .understoodCount(understood)
                .familiarCount(familiar)
                .unfamiliarCount(unfamiliar)
                .lastPosition(lastPosition)
                .build();
    }
}
