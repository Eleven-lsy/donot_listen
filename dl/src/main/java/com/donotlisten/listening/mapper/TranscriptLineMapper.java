package com.donotlisten.listening.mapper;

import com.donotlisten.listening.TranscriptLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 原文逐句 MyBatis Mapper。
 * 负责 transcript_lines 表的读取、统计和写入。
 */
@Mapper
public interface TranscriptLineMapper {

    List<TranscriptLine> findByListeningIdOrderByLineNumberAsc(@Param("listeningId") String listeningId);

    int countByListeningId(@Param("listeningId") String listeningId);

    int insert(TranscriptLine transcriptLine);

    @Select("SELECT id, listening_id, line_number, speaker, content, start_time, end_time FROM transcript_lines WHERE id = #{id}")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "lineNumber", column = "line_number"),
        @Result(property = "speaker", column = "speaker"),
        @Result(property = "content", column = "content"),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time")
    })
    TranscriptLine selectById(@Param("id") String id);
}
