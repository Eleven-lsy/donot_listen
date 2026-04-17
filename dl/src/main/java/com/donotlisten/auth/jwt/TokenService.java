package com.donotlisten.auth.jwt;

import com.donotlisten.common.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/**
 * 轻量 Token 服务。
 * 当前项目没有引入完整的 Spring Security 认证链，而是用一个简单的签名 token 完成登录态校验。
 */
@Service
public class TokenService {

    private final String secret;
    private final long ttlDays;

    public TokenService(
            @Value("${app.auth.secret}") String secret,
            @Value("${app.auth.ttl-days:30}") long ttlDays
    ) {
        this.secret = secret;
        this.ttlDays = ttlDays;
    }

    /**
     * 生成登录 token。
     * token 由用户 ID、过期时间和 HMAC 签名组成，最后再做 URL 安全的 Base64 编码。
     *
     * @param userId 用户 ID
     * @return 编码后的 token
     */
    public String createToken(String userId) {
        long expiresAt = Instant.now().plus(Duration.ofDays(ttlDays)).getEpochSecond();
        String expiry = Long.toString(expiresAt);
        String payload = userId + ":" + expiry;
        String signature = sign(payload);
        String token = payload + ":" + signature;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 解析 token 并提取用户 ID。
     * 解析过程中会同时完成解码、签名校验和过期校验。
     *
     * @param token 前端提交的 Bearer Token
     * @return token 中的用户 ID
     */
    public String parseUserId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":", 3);
            if (parts.length != 3) {
                throw unauthorized();
            }

            String userId = parts[0];
            long expiresAt = Long.parseLong(parts[1]);
            String payload = userId + ":" + parts[1];
            String expectedSignature = sign(payload);

            if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                throw unauthorized();
            }
            if (Instant.now().getEpochSecond() > expiresAt) {
                throw unauthorized();
            }

            return userId;
        } catch (IllegalArgumentException exception) {
            throw unauthorized();
        }
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("无法生成登录令牌", exception);
        }
    }


    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, 401, "登录已过期，请重新登录");
    }

    /**
     * 验证 token 是否有效。
     */
    public boolean validateToken(String token) {
        try {
            parseUserId(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 从 token 中获取用户名（这里用 userId 作为 username）
     */
    public String getUsernameFromToken(String token) {
        return parseUserId(token);
    }

    /**
     * 从 token 中获取用户 ID
     */
    public Long getUserIdFromToken(String token) {
        try {
            String userIdStr = parseUserId(token);
            return Long.parseLong(userIdStr);
        } catch (Exception e) {
            return null;
        }
    }
}
