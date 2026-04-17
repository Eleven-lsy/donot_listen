package com.donotlisten.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * CORS 跨域配置。
 * 配置允许的来源、方法、头部等信息。
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:8080}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${cors.allowed-headers:*}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 设置允许的来源
        Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(config::addAllowedOriginPattern);

        // 设置允许的方法
        Arrays.stream(allowedMethods.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(config::addAllowedMethod);

        // 设置允许的头部
        if ("*".equals(allowedHeaders)) {
            config.addAllowedHeader("*");
        } else {
            Arrays.stream(allowedHeaders.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(config::addAllowedHeader);
        }

        // 是否允许携带凭证
        config.setAllowCredentials(allowCredentials);

        // 预检请求缓存时间
        config.setMaxAge(maxAge);

        // 添加暴露的头部
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        config.addExposedHeader("X-Requested-With");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 前端静态资源（开发时使用 qianduan 目录）
        registry.addResourceHandler("/static/**")
                .addResourceLocations(
                        "classpath:/static/",
                        "file:./static/",
                        "file:./qianduan/"
                );
        
        // 直接映射 HTML 文件（无需 /static/ 前缀）
        registry.addResourceHandler("/*.html")
                .addResourceLocations("file:./qianduan/");
        
        // 前端资源目录
        registry.addResourceHandler("/audio/**")
                .addResourceLocations("file:./qianduan/audio/");
        
        registry.addResourceHandler("/image/**")
                .addResourceLocations("file:./qianduan/image/");
        
        // 样式和脚本
        registry.addResourceHandler("/styles.css")
                .addResourceLocations("file:./qianduan/styles.css");
    }
}
