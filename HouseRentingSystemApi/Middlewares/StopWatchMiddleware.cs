using System.Diagnostics;

namespace HouseRentingSystemApi.Middlewares;

public sealed class StopWatchMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await next(context);
        }
        finally
        {
            sw.Stop();
            Console.WriteLine(
                $"[{DateTimeOffset.UtcNow:O}] {context.Request.Method} {context.Request.Path}{context.Request.QueryString} -> {context.Response.StatusCode} in {sw.Elapsed.TotalMilliseconds:0.##} ms"
            );
        }
    }
}

