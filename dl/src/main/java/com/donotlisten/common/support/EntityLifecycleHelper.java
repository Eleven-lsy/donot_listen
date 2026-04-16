package com.donotlisten.common.support;

import com.donotlisten.collection.UserCollection;
import com.donotlisten.listening.ListeningFeedback;
import com.donotlisten.listening.ListeningMaterial;
import com.donotlisten.listening.TranscriptLine;
import com.donotlisten.listening.UserListeningProgress;
import com.donotlisten.user.User;
import org.springframework.stereotype.Component;

/**
 * 实体生命周期辅助器。
 * 负责在进入持久化层之前统一填充主键、创建时间和更新时间，避免业务层直接调用实体生命周期方法。
 */
@Component
public class EntityLifecycleHelper {

    public void prepareForInsert(User user) {
        user.prePersist();
    }

    public void prepareForUpdate(User user) {
        user.preUpdate();
    }

    public void prepareForInsert(ListeningMaterial material) {
        material.prePersist();
    }

    public void prepareForUpdate(ListeningMaterial material) {
        material.preUpdate();
    }

    public void prepareForInsert(TranscriptLine transcriptLine) {
        transcriptLine.prePersist();
    }

    public void prepareForInsert(UserCollection userCollection) {
        userCollection.prePersist();
    }

    public void prepareForInsert(ListeningFeedback feedback) {
        feedback.prePersist();
    }

    public void prepareForUpdate(ListeningFeedback feedback) {
        feedback.preUpdate();
    }

    public void prepareForInsert(UserListeningProgress progress) {
        progress.prePersist();
    }

    public void prepareForUpdate(UserListeningProgress progress) {
        progress.preUpdate();
    }
}
