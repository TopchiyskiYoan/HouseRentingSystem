using HouseRentingSystemApi.Bootstrap;

namespace HouseRentingSystemApi;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.UseUrls("http://0.0.0.0:5000");

        builder.Services.AddApiLayer(builder.Configuration, builder.Environment);

        var app = builder.Build();
        await DataSeeder.SeedAsync(app);
        app.UseApiPipeline();
        app.Run();
    }
}
