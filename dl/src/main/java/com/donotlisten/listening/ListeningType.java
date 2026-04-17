package com.donotlisten.listening;

/**
 * 听力类型枚举。
 * 对应产品层面的 dialogue、passage、lecture 三种材料分类。
 */
public enum ListeningType {
    DIALOGUE("dialogue"),
    PASSAGE("passage"),
    LECTURE("lecture");

    private final String value;

    ListeningType(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static ListeningType fromValue(String value) {
        for (ListeningType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("不支持的听力类型: " + value);
    }
}
