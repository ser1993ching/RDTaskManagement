using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace TaskManageSystem.Infrastructure.Middleware;

/// <summary>
/// 中间件：将前端发送的 camelCase JSON 请求体转换为 PascalCase
/// 支持嵌套对象和数组
/// </summary>
public class CamelCaseToPascalCaseMiddleware
{
    private readonly RequestDelegate _next;

    public CamelCaseToPascalCaseMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 只处理 Content-Type 为 application/json 的 POST/PUT/PATCH 请求
        if (context.Request.ContentType?.Contains("application/json") == true &&
            (context.Request.Method == "POST" || context.Request.Method == "PUT" || context.Request.Method == "PATCH"))
        {
            // 启用缓冲，以便多次读取请求体
            context.Request.EnableBuffering();

            using var reader = new StreamReader(
                context.Request.Body,
                encoding: System.Text.Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                bufferSize: 1024,
                leaveOpen: true);

            var body = await reader.ReadToEndAsync();

            // 重置请求体位置，以便后续模型绑定可以读取
            context.Request.Body.Position = 0;

            if (!string.IsNullOrWhiteSpace(body))
            {
                try
                {
                    // 将 JSON 从 camelCase 转换为 PascalCase
                    var convertedBody = ConvertCamelCaseToPascalCase(body);

                    // 创建新的请求体流
                    var newBody = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(convertedBody));
                    context.Request.Body = newBody;

                    // 更新 Content-Length
                    context.Request.ContentLength = newBody.Length;
                }
                catch (JsonException)
                {
                    // 如果 JSON 解析失败，保持原样，让后续处理捕获错误
                }
            }
        }

        await _next(context);
    }

    /// <summary>
    /// 将 JSON 字符串中的 camelCase 键名转换为 PascalCase
    /// </summary>
    private string ConvertCamelCaseToPascalCase(string json)
    {
        var node = JsonNode.Parse(json);
        if (node == null) return json;

        ConvertNode(node);

        return node.ToJsonString(new JsonSerializerOptions
        {
            WriteIndented = false
        });
    }

    /// <summary>
    /// 递归转换节点中的所有键名
    /// </summary>
    private void ConvertNode(JsonNode node)
    {
        if (node is JsonObject obj)
        {
            // 创建要修改的键列表（不能在遍历时修改字典）
            var keysToConvert = new List<string>();

            foreach (var kvp in obj)
            {
                // 检查是否是 camelCase 键（首字母小写且包含大写字母）
                if (IsCamelCase(kvp.Key))
                {
                    keysToConvert.Add(kvp.Key);
                }

                // 递归处理子节点
                if (kvp.Value != null)
                {
                    ConvertNode(kvp.Value);
                }
            }

            // 转换键名
            foreach (var key in keysToConvert)
            {
                var pascalKey = ToPascalCase(key);
                obj[pascalKey] = obj[key];
                obj.Remove(key);
            }
        }
        else if (node is JsonArray arr)
        {
            foreach (var item in arr)
            {
                if (item != null)
                {
                    ConvertNode(item);
                }
            }
        }
    }

    /// <summary>
    /// 检查字符串是否为 camelCase 格式（首字母小写）
    /// </summary>
    private bool IsCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || str.Length < 1) return false;

        // 首字母小写则认为需要转换（不要求后续有大写字母）
        return char.IsLower(str[0]);
    }

    /// <summary>
    /// 将 camelCase 转换为 PascalCase（首字母大写）
    /// </summary>
    private string ToPascalCase(string str)
    {
        if (string.IsNullOrEmpty(str)) return str;

        return char.ToUpperInvariant(str[0]) + str[1..];
    }
}

/// <summary>
/// 扩展方法，用于注册中间件
/// </summary>
public static class CamelCaseToPascalCaseMiddlewareExtensions
{
    public static IApplicationBuilder UseCamelCaseToPascalCase(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CamelCaseToPascalCaseMiddleware>();
    }
}
