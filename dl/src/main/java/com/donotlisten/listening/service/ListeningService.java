package com.donotlisten.listening.service;

import com.donotlisten.listening.dto.ListeningDetailResponse;
import com.donotlisten.listening.dto.ListeningListResponse;
import com.donotlisten.listening.dto.TranscriptResponse;

import java.util.List;

/**
 * 听力服务接口。
 * 定义播放器页所需的详情和原文查询能力。
 */
public interface ListeningService {

    ListeningListResponse getList(String authorizationHeader, Integer year, Integer level, String type, Integer page, Integer pageSize);

    ListeningDetailResponse getDetail(String authorizationHeader, String listeningId);

    TranscriptResponse getTranscript(String authorizationHeader, String listeningId);

    List<ListeningListResponse.ListeningItem> getListeningSet(String authorizationHeader, Integer year, Integer month, Integer level, Integer setNumber, String type);
}
