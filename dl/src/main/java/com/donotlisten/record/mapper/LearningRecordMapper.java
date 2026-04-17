package com.donotlisten.record.mapper;

import com.donotlisten.record.dto.LearningRecordDetailResponse;
import com.donotlisten.record.dto.LearningStatisticsResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface LearningRecordMapper {

    List<LearningRecordDetailResponse> findByUserIdPageable(
            @Param("userId") String userId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    long countByUserId(@Param("userId") String userId);

    LearningStatisticsResponse findStatisticsByUserId(@Param("userId") String userId);

    int insertProgress(
            @Param("id") String id,
            @Param("userId") String userId,
            @Param("listeningId") String listeningId,
            @Param("duration") Integer duration,
            @Param("progress") Integer progress,
            @Param("understoodCount") Integer understoodCount,
            @Param("familiarCount") Integer familiarCount,
            @Param("unfamiliarCount") Integer unfamiliarCount,
            @Param("lastPosition") Integer lastPosition,
            @Param("createdAt") LocalDateTime createdAt,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    int updateProgress(
            @Param("userId") String userId,
            @Param("listeningId") String listeningId,
            @Param("duration") Integer duration,
            @Param("progress") Integer progress,
            @Param("understoodCount") Integer understoodCount,
            @Param("familiarCount") Integer familiarCount,
            @Param("unfamiliarCount") Integer unfamiliarCount,
            @Param("lastPosition") Integer lastPosition,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    LearningRecordDetailResponse findProgressByUserIdAndListeningId(
            @Param("userId") String userId,
            @Param("listeningId") String listeningId
    );

    int deleteByUserId(@Param("userId") String userId);
}
