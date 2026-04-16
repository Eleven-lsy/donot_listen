package com.donotlisten.listening.mapper;

import com.donotlisten.listening.ListeningFeedback;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

/**
 * 单句反馈 MyBatis Mapper。
 * 负责 listening_feedback 表的读取和写入。
 */
@Mapper
public interface ListeningFeedbackMapper {

    List<ListeningFeedback> findByUserIdAndListeningId(@Param("userId") String userId, @Param("listeningId") String listeningId);

    Optional<ListeningFeedback> findByUserIdAndListeningIdAndLineNumber(
            @Param("userId") String userId,
            @Param("listeningId") String listeningId,
            @Param("lineNumber") Integer lineNumber
    );

    int insert(ListeningFeedback feedback);

    int update(ListeningFeedback feedback);
}
