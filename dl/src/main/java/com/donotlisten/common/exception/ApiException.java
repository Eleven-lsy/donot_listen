package com.donotlisten.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 业务异常。
 * 用于在服务层显式抛出带 HTTP 状态码和业务码的异常，最终由全局异常处理器统一转换为接口响应。
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final int code;

    public ApiException(HttpStatus status, String message) {
        this(status, status.value(), message);
    }

    public ApiException(HttpStatus status, int code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public int getCode() {
        return code;
    }
}
