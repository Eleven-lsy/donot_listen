package com.donotlisten;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 应用启动入口。
 * 负责启动 Spring Boot 容器，并完成整个后端服务的自动装配。
 */
@SpringBootApplication
@MapperScan("com.donotlisten.*.mapper")
public class DlApplication {

    /**
     * 程序主入口。
     * 启动 Spring Boot 应用，触发配置加载、组件扫描以及内嵌容器初始化。
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(DlApplication.class, args);
    }
}
