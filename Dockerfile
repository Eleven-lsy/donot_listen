# 不听听力应用 - 后端 Dockerfile
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# 复制 Maven 相关文件
COPY dl/pom.xml dl/
COPY dl/.mvn .mvn
COPY dl/mvnw .

# 设置权限
RUN chmod +x mvnw

# 下载依赖（利用 Docker 缓存）
RUN ./mvnw dependency:go-offline -B

# 复制源代码
COPY dl/src ./src

# 构建应用
RUN ./mvnw package -DskipTests -B

# 第二阶段：运行镜像
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 创建日志目录
RUN mkdir -p logs

# 从构建阶段复制 JAR 文件
COPY --from=builder /app/target/*.jar app.jar

# 复制前端静态资源（如果需要）
# COPY qianduan/dist /app/static

# 暴露端口
EXPOSE 8082

# 设置 JVM 参数
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
