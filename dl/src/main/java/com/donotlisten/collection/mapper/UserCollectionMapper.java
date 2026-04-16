package com.donotlisten.collection.mapper;

import com.donotlisten.collection.UserCollection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

/**
 * 用户收藏 MyBatis Mapper。
 * 负责 user_collections 表的查询和写入。
 */
@Mapper
public interface UserCollectionMapper {

    boolean existsByUserIdAndListeningId(@Param("userId") String userId, @Param("listeningId") String listeningId);

    Optional<UserCollection> findByUserIdAndListeningId(@Param("userId") String userId, @Param("listeningId") String listeningId);

    int insert(UserCollection userCollection);
}
