package com.donotlisten.common;

/**
 * 统一响应体。
 * 所有控制器都通过该结构返回数据，保证前后端联调时响应格式一致。
 */
public record ApiResponse<T>(int code, String msg, T data) {

    public static final int SUCCESS_CODE = 0;
    public static final int ERROR_CODE = 500;

    /**
     * 构建默认成功响应。
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(SUCCESS_CODE, "success", data);
    }

    /**
     * 构建带自定义提示语的成功响应。
     */
    public static <T> ApiResponse<T> success(String msg, T data) {
        return new ApiResponse<>(SUCCESS_CODE, msg, data);
    }

    /**
     * 构建不携带数据体的成功响应。
     */
    public static ApiResponse<Void> success(String msg) {
        return new ApiResponse<>(SUCCESS_CODE, msg, null);
    }

    /**
     * 构建错误响应。
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(ERROR_CODE, message, null);
    }

    /**
     * 构建错误响应（带错误码）。
     */
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
