using HouseRentingSystemApi.Bootstrap;

namespace HouseRentingSystemApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddApiLayer(builder.Configuration);

        var app = builder.Build();
        app.UseApiPipeline();
        app.Run();
    }
}
