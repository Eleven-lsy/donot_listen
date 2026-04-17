# 多阶段构建 - 仅构建后端
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /build

# 复制 Maven 配置
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

RUN chmod +x mvnw

# 下载依赖
RUN ./mvnw dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建
RUN ./mvnw package -DskipTests -B

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN mkdir -p logs

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8082

ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
