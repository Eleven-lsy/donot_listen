package com.donotlisten.listening;

import com.donotlisten.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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
 * 用户听力进度实体。
 * 对应 user_listening_progress 表，用于保存用户在某篇听力上的学习快照。
 * 详情页和个人中心都直接读取这张表，而不是每次实时扫描全部反馈。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "user_listening_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "listening_id"})
)
public class UserListeningProgress {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listening_id", nullable = false)
    private ListeningMaterial listening;

    @Builder.Default
    @Column(nullable = false)
    private Integer duration = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer progress = 0;

    @Builder.Default
    @Column(name = "understood_count", nullable = false)
    private Integer understoodCount = 0;

    @Builder.Default
    @Column(name = "familiar_count", nullable = false)
    private Integer familiarCount = 0;

    @Builder.Default
    @Column(name = "unfamiliar_count", nullable = false)
    private Integer unfamiliarCount = 0;

    @Builder.Default
    @Column(name = "last_position", nullable = false)
    private Integer lastPosition = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 在首次入库前补齐主键和时间字段。
     */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    /**
     * 在更新进度快照时刷新更新时间。
     */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
