package com.donotlisten.listening.mapper;

import com.donotlisten.listening.UserListeningProgress;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

/**
 * 用户听力进度 MyBatis Mapper。
 * 负责 user_listening_progress 表的读取和写入。
 */
@Mapper
public interface UserListeningProgressMapper {

    List<UserListeningProgress> findByUserId(@Param("userId") String userId);

    Optional<UserListeningProgress> findByUserIdAndListeningId(@Param("userId") String userId, @Param("listeningId") String listeningId);

    int insert(UserListeningProgress progress);

    int update(UserListeningProgress progress);
}
