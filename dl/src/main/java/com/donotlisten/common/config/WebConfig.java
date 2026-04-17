package com.donotlisten.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 层配置。
 * 用于补充跨域等 Web 访问配置，方便前端静态页面直接调用后端接口。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 配置跨域规则。
     * 允许前端静态页通过浏览器直接访问 /api 下的后端接口。
     * @param registry Spring MVC 跨域注册器
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
