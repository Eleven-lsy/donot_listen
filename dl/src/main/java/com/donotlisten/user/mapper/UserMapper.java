package com.donotlisten.user.mapper;

import com.donotlisten.user.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

/**
 * 用户 MyBatis Mapper。
 * 负责 users 表的查询、插入和统计字段更新。
 */
@Mapper
public interface UserMapper {

    boolean existsByUsernameIgnoreCase(@Param("username") String username);

    boolean existsByEmailIgnoreCase(@Param("email") String email);

    Optional<User> findByUsernameOrEmail(@Param("principal") String principal);

    Optional<User> findById(@Param("id") String id);

    int insert(User user);

    int updateActivityAndStats(User user);
}
