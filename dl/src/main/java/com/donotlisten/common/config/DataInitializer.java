package com.donotlisten.common.config;

import com.donotlisten.common.service.SeedDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 开发环境种子数据初始化器。
 * 配置层只负责在应用启动时触发种子服务，不再直接访问持久化层。
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final SeedDataService seedDataService;

    @Override
    public void run(ApplicationArguments args) {
        seedDataService.initialize();
    }
}
