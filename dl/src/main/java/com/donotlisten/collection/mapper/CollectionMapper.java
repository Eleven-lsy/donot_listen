package com.donotlisten.collection.mapper;

import com.donotlisten.collection.dto.CollectionWithMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CollectionMapper {

    List<CollectionWithMaterial> findByUserIdPageable(
            @Param("userId") String userId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    long countByUserId(@Param("userId") String userId);

    boolean existsByUserIdAndListeningId(
            @Param("userId") String userId,
            @Param("listeningId") String listeningId
    );

    Optional<CollectionWithMaterial> findByUserIdAndListeningId(
            @Param("userId") String userId,
            @Param("listeningId") String listeningId
    );

    int insert(@Param("id") String id,
               @Param("userId") String userId,
               @Param("listeningId") String listeningId,
               @Param("createdAt") java.time.LocalDateTime createdAt);

    int deleteByUserIdAndListeningId(
            @Param("userId") String userId,
            @Param("listeningId") String listeningId
    );
}
