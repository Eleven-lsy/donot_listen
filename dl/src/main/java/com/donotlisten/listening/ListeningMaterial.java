package com.donotlisten.listening;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 听力主表实体。
 * 保存整篇听力的标题、年月、级别、类型、时长和资源地址等主数据，对应 listening_materials 表。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "listening_materials")
public class ListeningMaterial {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "material_year", nullable = false)
    private Integer year;

    @Column(name = "material_month", nullable = false)
    private Integer month;

    @Column(name = "set_number", nullable = false)
    @Builder.Default
    private Integer setNumber = 1;

    @Column(nullable = false)
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListeningType type;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private Integer difficulty;

    @Column(name = "cover_image", length = 255)
    private String coverImage;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Builder.Default
    @Column(name = "play_count", nullable = false)
    private Long playCount = 0L;

    @Builder.Default
    @Column(name = "mastered_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal masteredRate = BigDecimal.ZERO;

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
     * 在更新主表记录前刷新更新时间。
     */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
