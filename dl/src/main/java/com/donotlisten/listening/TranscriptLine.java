package com.donotlisten.listening;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * 原文逐句实体。
 * 表示某篇听力中的一行句子以及对应的说话人和音频时间区间，对应 transcript_lines 表。
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "transcript_lines",
        uniqueConstraints = @UniqueConstraint(columnNames = {"listening_id", "line_number"})
)
public class TranscriptLine {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listening_id", nullable = false)
    private ListeningMaterial listening;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(length = 20)
    private String speaker;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "start_time")
    private Double startTime;

    @Column(name = "end_time")
    private Double endTime;

    /**
     * 在首次入库前自动生成主键。
     */
    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
    }
}
