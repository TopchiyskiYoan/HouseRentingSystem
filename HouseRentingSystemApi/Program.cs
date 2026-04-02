using HouseRentingSystemApi.Bootstrap;

namespace HouseRentingSystemApi;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddApiLayer(builder.Configuration);

        var app = builder.Build();
        await HouseJsonSeeder.ApplyAsync(app);
        app.UseApiPipeline();
        app.Run();
    }
}
