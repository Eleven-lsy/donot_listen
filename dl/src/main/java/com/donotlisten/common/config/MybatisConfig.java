package com.donotlisten.common.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * MyBatis 配置。
 * 显式注册 SqlSessionFactory、SqlSessionTemplate 和 mapper 扫描，确保 mapper.xml 结构在当前项目中稳定生效。
 */
@Configuration
@MapperScan(basePackages = {
        "com.donotlisten.user.mapper",
        "com.donotlisten.collection.mapper",
        "com.donotlisten.listening.mapper"
})
public class MybatisConfig {

    /**
     * 注册 SqlSessionFactory。
     *
     * @param dataSource 数据源
     * @param applicationContext Spring 上下文
     * @return SqlSessionFactory
     * @throws Exception 初始化失败时抛出
     */
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource, ApplicationContext applicationContext) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setTypeAliasesPackage("com.donotlisten");
        factoryBean.setMapperLocations(applicationContext.getResources("classpath*:mapper/**/*.xml"));
        return factoryBean.getObject();
    }

    /**
     * 注册 SqlSessionTemplate。
     *
     * @param sqlSessionFactory SqlSessionFactory
     * @return SqlSessionTemplate
     */
    @Bean
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
