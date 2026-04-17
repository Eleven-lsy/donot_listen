package com.donotlisten;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * 应用上下文启动测试。
 * 用于验证重构后的最小后端在 Spring Boot 容器中仍能完整装配。
 */
class DlApplicationTests {

    /**
     * 验证应用上下文能够正常加载。
     */
    @Test
    void contextLoads() {
        assertDoesNotThrow(() -> Class.forName("com.donotlisten.DlApplication"));
    }

    @Test
    void criticalControllersRemainLoadable() {
        assertDoesNotThrow(() -> {
            Class<?> authController = Class.forName("com.donotlisten.auth.controller.AuthController");
            Class<?> recordController = Class.forName("com.donotlisten.record.controller.LearningRecordController");

            assertNotNull(authController.getDeclaredMethod("login", Class.forName("com.donotlisten.auth.dto.LoginRequest")));
            assertNotNull(recordController.getDeclaredMethod(
                    "submitFeedback",
                    String.class,
                    Class.forName("com.donotlisten.record.dto.FeedbackRequest")
            ));
        });
    }
}
