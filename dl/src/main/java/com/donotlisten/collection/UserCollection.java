package com.donotlisten.collection;

import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户收藏实体。
 * 用于表示用户与整篇听力之间的收藏关系，对应 user_collections 表。
 * 虽然当前最小接口不提供收藏增删入口，但详情接口仍会读取收藏状态。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "user_collections",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "listening_id"})
)
public class UserCollection {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listening_id", nullable = false)
    private ListeningMaterial listening;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 在首次入库前补齐主键和创建时间。
     */
    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
