namespace HouseRentingSystemApi.Middlewares;

public static class StopWatchMiddlewareExtensions
{
    public static IApplicationBuilder UseStopWatchMiddlare(this IApplicationBuilder app)
        => app.UseMiddleware<StopWatchMiddleware>();
}

