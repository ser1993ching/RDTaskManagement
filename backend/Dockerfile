# 构建阶段
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /src

# 复制项目文件
COPY src/Api/TaskManageSystem.Api.csproj src/Api/
COPY src/Application/TaskManageSystem.Application.csproj src/Application/
COPY src/Domain/TaskManageSystem.Domain.csproj src/Domain/
COPY src/Infrastructure/TaskManageSystem.Infrastructure.csproj src/Infrastructure/

# 恢复依赖
RUN dotnet restore src/Api/TaskManageSystem.Api.csproj

# 复制源代码并构建
COPY . .
RUN dotnet build src/Api/TaskManageSystem.Api.csproj -c Release --no-restore

# 发布
RUN dotnet publish src/Api/TaskManageSystem.Api.csproj -c Release -o /app/publish --no-build

# 生产阶段
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# 创建日志目录
RUN mkdir -p /app/logs

# 复制发布产物
COPY --from=builder /app/publish .

# 设置非 root 用户运行
RUN chown -R app:app /app
USER app

# 暴露端口
EXPOSE 5001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5001/swagger/index.html || exit 1

# 启动应用
ENTRYPOINT ["dotnet", "TaskManageSystem.Api.dll"]
