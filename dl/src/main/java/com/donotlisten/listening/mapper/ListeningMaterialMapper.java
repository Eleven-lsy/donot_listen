package com.donotlisten.listening.mapper;

import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.listening.dto.ListeningListResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

/**
 * 听力主表 MyBatis Mapper。
 * 负责 listening_materials 表的读取和写入。
 */
@Mapper
public interface ListeningMaterialMapper {

    Optional<ListeningMaterial> findById(@Param("id") String id);

    List<ListeningListResponse.ListeningItem> findListPageable(
            @Param("userId") String userId,
            @Param("year") Integer year,
            @Param("level") Integer level,
            @Param("type") String type,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    long countListPageable(
            @Param("year") Integer year,
            @Param("level") Integer level,
            @Param("type") String type
    );

List<ListeningListResponse.ListeningItem> findAllGrouped();

    List<ListeningListResponse.ListeningItem> findByYearMonthLevelAndSetNumber(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("level") Integer level,
            @Param("setNumber") Integer setNumber
    );

    List<ListeningListResponse.ListeningItem> findByYearMonthLevelSetNumberAndType(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("level") Integer level,
            @Param("setNumber") Integer setNumber,
            @Param("type") String type
    );

    int insert(ListeningMaterial material);

    int update(ListeningMaterial material);
}
