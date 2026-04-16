package com.donotlisten.common.service.impl;

import com.donotlisten.collection.UserCollection;
import com.donotlisten.collection.mapper.UserCollectionMapper;
import com.donotlisten.common.service.SeedDataService;
import com.donotlisten.common.support.EntityLifecycleHelper;
import com.donotlisten.listening.FeedbackStatus;
import com.donotlisten.listening.ListeningFeedback;
import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.listening.ListeningType;
import com.donotlisten.listening.TranscriptLine;
import com.donotlisten.listening.UserListeningProgress;
import com.donotlisten.listening.mapper.ListeningFeedbackMapper;
import com.donotlisten.listening.mapper.ListeningMaterialMapper;
import com.donotlisten.listening.mapper.TranscriptLineMapper;
import com.donotlisten.listening.mapper.UserListeningProgressMapper;
import com.donotlisten.user.User;
import com.donotlisten.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 种子数据服务实现。
 * 集中处理开发环境的初始化写库逻辑，避免配置层直接访问 mapper。
 */
@Service
@RequiredArgsConstructor
public class SeedDataServiceImpl implements SeedDataService {

    private final ListeningMaterialMapper listeningMaterialMapper;
    private final TranscriptLineMapper transcriptLineMapper;
    private final UserMapper userMapper;
    private final UserCollectionMapper userCollectionMapper;
    private final ListeningFeedbackMapper listeningFeedbackMapper;
    private final UserListeningProgressMapper userListeningProgressMapper;
    private final PasswordEncoder passwordEncoder;
    private final EntityLifecycleHelper entityLifecycleHelper;

    @Override
    @Transactional
    public void initialize() {
        // Demo数据已注释掉，如果需要可以取消注释
        // ListeningMaterial cet4Set1Dialogue = seedListening(
        //         "demo-2024-6-cet4-conversation-set1",
        //         "2024年6月CET-4听力-第一套-对话",
        //         2024, 6, 4, ListeningType.DIALOGUE, 180, 3,
        //         "https://placehold.co/600x400/png?text=CET4+Set1+Dialogue",
        //         "https://example.com/audio/cet4-set1-dialogue.mp3",
        //         List.of(
        //                 line(1, "W", "Good morning, this is the reception desk. How can I help you?", 0D, 5D),
        //                 line(2, "M", "Hi, I'm calling about the conference room booking for tomorrow.", 5D, 10D),
        //                 line(3, "W", "Sure, let me check the availability. What time do you need it?", 10D, 15D),
        //                 line(4, "M", "From 10 AM to 1 PM. We have a team meeting.", 15D, 20D),
        //                 line(5, "W", "The main room is available. I can reserve it for you.", 20D, 25D)
        //         ),
        //         99
        // );
        // ListeningMaterial cet4Set1Passage = seedListening(
        //         "demo-2024-6-cet4-passage-set1",
        //         "2024年6月CET-4听力-第一套-短文",
        //         2024, 6, 4, ListeningType.PASSAGE, 220, 4,
        //         "https://placehold.co/600x400/png?text=CET4+Set1+Passage",
        //         "https://example.com/audio/cet4-set1-passage.mp3",
        //         List.of(
        //                 line(1, "N", "Many students think learning a language only means memorizing words.", 0D, 6D),
        //                 line(2, "N", "In fact, listening practice is just as important as vocabulary study.", 6D, 12D),
        //                 line(3, "N", "Short but repeated listening sessions can improve comprehension quickly.", 12D, 18D),
        //                 line(4, "N", "That is why daily listening habits are recommended by teachers.", 18D, 24D)
        //         ),
        //         99
        // );
        // ListeningMaterial cet4Set2Dialogue = seedListening(
        //         "demo-2024-6-cet4-conversation-set2",
        //         "2024年6月CET-4听力-第二套-对话",
        //         2024, 6, 4, ListeningType.DIALOGUE, 180, 3,
        //         "https://placehold.co/600x400/png?text=CET4+Set2+Dialogue",
        //         "https://example.com/audio/cet4-set2-dialogue.mp3",
        //         List.of(
        //                 line(1, "M", "Excuse me, could you tell me how to get to the library?", 0D, 5D),
        //                 line(2, "W", "Of course, it's just two blocks away from here.", 5D, 10D),
        //                 line(3, "M", "Should I walk or take the bus?", 10D, 15D),
        //                 line(4, "W", "Walking is fine, it's quite close.", 15D, 20D),
        //                 line(5, "M", "Thank you very much for your help.", 20D, 25D)
        //         ),
        //         99
        // );
        // ListeningMaterial cet4Set2Passage = seedListening(
        //         "demo-2024-6-cet4-passage-set2",
        //         "2024年6月CET-4听力-第二套-短文",
        //         2024, 6, 4, ListeningType.PASSAGE, 220, 4,
        //         "https://placehold.co/600x400/png?text=CET4+Set2+Passage",
        //         "https://example.com/audio/cet4-set2-passage.mp3",
        //         List.of(
        //                 line(1, "N", "Reading is one of the best habits a person can develop.", 0D, 6D),
        //                 line(2, "N", "It not only improves knowledge but also enhances creativity.", 6D, 12D),
        //                 line(3, "N", "People who read regularly tend to have better communication skills.", 12D, 18D),
        //                 line(4, "N", "Books open doors to new worlds and experiences.", 18D, 24D)
        //         ),
        //         99
        // );
        // ListeningMaterial lecture = seedListening(
        //         "demo-2025-12-cet6-lecture-1",
        //         "2025 年 12 月 CET-6 听力 - 讲座 1",
        //         2025, 12, 6, ListeningType.LECTURE, 360, 5,
        //         "https://placehold.co/600x400/png?text=Lecture+1",
        //         "https://example.com/audio/lecture-1.mp3",
        //         List.of(
        //                 line(1, "L", "Today we will discuss how sleep affects memory formation.", 0D, 8D),
        //                 line(2, "L", "Researchers have found that deep sleep helps consolidate new information.", 8D, 16D),
        //                 line(3, "L", "Students who sleep well often perform better on language tests.", 16D, 24D),
        //                 line(4, "L", "The effect becomes stronger when review happens before bedtime.", 24D, 32D)
        //         )
        // );

        // if (cet4Set1Dialogue != null) updateMasteredRate(cet4Set1Dialogue, BigDecimal.valueOf(0.50).setScale(2));
        // if (cet4Set1Passage != null) updateMasteredRate(cet4Set1Passage, BigDecimal.valueOf(0.40).setScale(2));
        // if (cet4Set2Dialogue != null) updateMasteredRate(cet4Set2Dialogue, BigDecimal.valueOf(0.45).setScale(2));
        // if (cet4Set2Passage != null) updateMasteredRate(cet4Set2Passage, BigDecimal.valueOf(0.35).setScale(2));
        // if (lecture != null) updateMasteredRate(lecture, BigDecimal.valueOf(0.25).setScale(2));

        User demoUser = userMapper.findByUsernameOrEmail("demo").orElseGet(() -> {
            User user = User.builder()
                    .username("demo")
                    .email("demo@example.com")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .avatar("https://placehold.co/128x128/png?text=Demo")
                    .level(4)
                    .currentStreak(7)
                    .longestStreak(21)
                    .build();
            entityLifecycleHelper.prepareForInsert(user);
            userMapper.insert(user);
            return user;
        });

        // Demo数据的收藏、反馈和进度已注释掉
        // seedCollection(demoUser, cet4Set1Dialogue);
        // seedCollection(demoUser, cet4Set1Passage);
        // seedCollection(demoUser, cet4Set2Dialogue);
        // seedCollection(demoUser, cet4Set2Passage);

        // seedFeedback(demoUser, cet4Set1Dialogue, 1, FeedbackStatus.UNDERSTOOD);
        // seedFeedback(demoUser, cet4Set1Dialogue, 2, FeedbackStatus.FAMILIAR);
        // seedFeedback(demoUser, cet4Set1Dialogue, 3, FeedbackStatus.UNFAMILIAR);
        // seedFeedback(demoUser, cet4Set1Passage, 1, FeedbackStatus.FAMILIAR);
        // seedFeedback(demoUser, cet4Set1Passage, 2, FeedbackStatus.UNDERSTOOD);
        // seedFeedback(demoUser, lecture, 1, FeedbackStatus.UNFAMILIAR);

        // seedProgress(demoUser, cet4Set1Dialogue, 120, 60, 1, 1, 1, 3);
        // seedProgress(demoUser, cet4Set1Passage, 160, 50, 1, 1, 0, 2);
        // seedProgress(demoUser, lecture, 90, 25, 0, 0, 1, 1);

        demoUser.setTotalListening(0);
        demoUser.setMasteredCount(0);
        demoUser.setCurrentStreak(7);
        demoUser.setLongestStreak(21);
        demoUser.touchLastActive();
        entityLifecycleHelper.prepareForUpdate(demoUser);
        userMapper.updateActivityAndStats(demoUser);
    }

    private ListeningMaterial seedListening(
            String id, String title, int year, int month, int level, ListeningType type,
            int duration, int difficulty, String coverImage, String audioUrl, List<TranscriptSeed> transcriptSeeds
    ) {
        return seedListening(id, title, year, month, level, type, duration, difficulty, coverImage, audioUrl, transcriptSeeds, 1);
    }

    private ListeningMaterial seedListening(
            String id, String title, int year, int month, int level, ListeningType type,
            int duration, int difficulty, String coverImage, String audioUrl, List<TranscriptSeed> transcriptSeeds,
            int setNumber
    ) {
        ListeningMaterial material = listeningMaterialMapper.findById(id).orElseGet(() -> {
            ListeningMaterial created = ListeningMaterial.builder()
                    .id(id)
                    .title(title)
                    .year(year)
                    .month(month)
                    .setNumber(setNumber)
                    .level(level)
                    .type(type)
                    .duration(duration)
                    .difficulty(difficulty)
                    .coverImage(coverImage)
                    .audioUrl(audioUrl)
                    .build();
            entityLifecycleHelper.prepareForInsert(created);
            listeningMaterialMapper.insert(created);
            return created;
        });

        if (transcriptLineMapper.countByListeningId(id) == 0) {
            transcriptSeeds.forEach(seed -> {
                TranscriptLine line = TranscriptLine.builder()
                        .listening(material)
                        .lineNumber(seed.lineNumber())
                        .speaker(seed.speaker())
                        .content(seed.text())
                        .startTime(seed.startTime())
                        .endTime(seed.endTime())
                        .build();
                entityLifecycleHelper.prepareForInsert(line);
                transcriptLineMapper.insert(line);
            });
        }

        return material;
    }

    private void updateMasteredRate(ListeningMaterial material, BigDecimal masteredRate) {
        material.setMasteredRate(masteredRate);
        entityLifecycleHelper.prepareForUpdate(material);
        listeningMaterialMapper.update(material);
    }

    private void seedCollection(User user, ListeningMaterial material) {
        if (!userCollectionMapper.existsByUserIdAndListeningId(user.getId(), material.getId())) {
            UserCollection collection = UserCollection.builder().user(user).listening(material).build();
            entityLifecycleHelper.prepareForInsert(collection);
            userCollectionMapper.insert(collection);
        }
    }

    private void seedFeedback(User user, ListeningMaterial material, int lineNumber, FeedbackStatus status) {
        var existing = listeningFeedbackMapper.findByUserIdAndListeningIdAndLineNumber(user.getId(), material.getId(), lineNumber);
        ListeningFeedback feedback = existing.orElseGet(() -> ListeningFeedback.builder()
                .user(user)
                .listening(material)
                .lineNumber(lineNumber)
                .build());
        feedback.setStatus(status);
        if (existing.isPresent()) {
            entityLifecycleHelper.prepareForUpdate(feedback);
            listeningFeedbackMapper.update(feedback);
        } else {
            entityLifecycleHelper.prepareForInsert(feedback);
            listeningFeedbackMapper.insert(feedback);
        }
    }

    private void seedProgress(
            User user, ListeningMaterial material, int duration, int progress,
            int understoodCount, int familiarCount, int unfamiliarCount, int lastPosition
    ) {
        var existing = userListeningProgressMapper.findByUserIdAndListeningId(user.getId(), material.getId());
        UserListeningProgress progressEntity = existing.orElseGet(() -> UserListeningProgress.builder()
                .user(user)
                .listening(material)
                .build());
        progressEntity.setDuration(duration);
        progressEntity.setProgress(progress);
        progressEntity.setUnderstoodCount(understoodCount);
        progressEntity.setFamiliarCount(familiarCount);
        progressEntity.setUnfamiliarCount(unfamiliarCount);
        progressEntity.setLastPosition(lastPosition);
        if (existing.isPresent()) {
            entityLifecycleHelper.prepareForUpdate(progressEntity);
            userListeningProgressMapper.update(progressEntity);
        } else {
            entityLifecycleHelper.prepareForInsert(progressEntity);
            userListeningProgressMapper.insert(progressEntity);
        }
    }

    private TranscriptSeed line(int lineNumber, String speaker, String text, Double startTime, Double endTime) {
        return new TranscriptSeed(lineNumber, speaker, text, startTime, endTime);
    }

    private record TranscriptSeed(int lineNumber, String speaker, String text, Double startTime, Double endTime) {
    }
}
