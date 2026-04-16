package com.donotlisten.listening;

/**
 * 单句反馈状态枚举。
 * 用于限定用户对句子的当前掌握状态，只允许听懂、熟悉、陌生三种值。
 */
public enum FeedbackStatus {
    UNDERSTOOD("understood"),
    FAMILIAR("familiar"),
    UNFAMILIAR("unfamiliar");

    private final String value;

    FeedbackStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static FeedbackStatus fromValue(String value) {
        for (FeedbackStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("不支持的反馈状态: " + value);
    }
}
