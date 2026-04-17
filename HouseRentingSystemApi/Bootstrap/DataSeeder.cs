using HouseRentingSystemApi.Data;
using HouseRentingSystemApi.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HouseRentingSystemApi.Bootstrap;

public static class DataSeeder
{
    private const string User1Id = "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1";
    private const string User2Id = "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2";

    public static async Task SeedAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await db.Database.MigrateAsync();

        await SeedUsersAsync(userManager);
        await SeedCategoriesAsync(db);
        await SeedHousesAsync(db);
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        if (await userManager.FindByEmailAsync("ivan@test.com") is null)
        {
            var ivan = new ApplicationUser
            {
                Id = User1Id,
                UserName = "ivan",
                Email = "ivan@test.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(ivan, "Ivan12");
        }

        if (await userManager.FindByEmailAsync("maria@test.com") is null)
        {
            var maria = new ApplicationUser
            {
                Id = User2Id,
                UserName = "maria",
                Email = "maria@test.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(maria, "Maria12");
        }
    }

    private static async Task SeedCategoriesAsync(AppDbContext db)
    {
        if (await db.Categories.AnyAsync()) return;

        db.Categories.AddRange(
            new Category { Name = "SingleBedroom" },
            new Category { Name = "DoubleBedroom" },
            new Category { Name = "FamilyBedroom" }
        );
        await db.SaveChangesAsync();
    }

    private static async Task SeedHousesAsync(AppDbContext db)
    {
        if (await db.Houses.AnyAsync()) return;

        var single = (await db.Categories.FirstAsync(c => c.Name == "SingleBedroom")).Id;
        var dbl    = (await db.Categories.FirstAsync(c => c.Name == "DoubleBedroom")).Id;
        var family = (await db.Categories.FirstAsync(c => c.Name == "FamilyBedroom")).Id;

        db.Houses.AddRange(
            // Ivan's houses (5)
            new House
            {
                Title = "Modern Apartment in Sofia Center",
                Address = "15 Vitosha Blvd, Sofia",
                Description = "Bright and modern apartment located in the heart of Sofia, close to restaurants and metro.",
                ImageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                PricePerMonth = 950,
                CategoryId = single,
                UserId = User1Id
            },
            new House
            {
                Title = "Luxury Penthouse with View",
                Address = "8 Cherni Vrah Blvd, Sofia",
                Description = "Spacious penthouse with panoramic city views and modern interior.",
                ImageUrl = "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
                PricePerMonth = 1800,
                CategoryId = family,
                UserId = User1Id
            },
            new House
            {
                Title = "Family House in Suburbs",
                Address = "5 Oak Street, Bankya",
                Description = "Quiet family house with garden, perfect for long-term living.",
                ImageUrl = "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
                PricePerMonth = 1200,
                CategoryId = single,
                UserId = User1Id
            },
            new House
            {
                Title = "Spacious House with Garden",
                Address = "7 Green Hill, Sofia",
                Description = "Large house with private garden and garage.",
                ImageUrl = "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
                PricePerMonth = 1500,
                CategoryId = single,
                UserId = User1Id
            },
            new House
            {
                Title = "Modern Loft",
                Address = "33 Industrial Zone, Sofia",
                Description = "Stylish loft with open space design and high ceilings.",
                ImageUrl = "https://images.unsplash.com/photo-1484154218962-a197022b5858",
                PricePerMonth = 1000,
                CategoryId = family,
                UserId = User1Id
            },
            // Maria's houses (5)
            new House
            {
                Title = "Cozy Studio near Park",
                Address = "22 Borisova Gradina, Sofia",
                Description = "Small but cozy studio next to the park, ideal for students or young professionals.",
                ImageUrl = "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                PricePerMonth = 600,
                CategoryId = dbl,
                UserId = User2Id
            },
            new House
            {
                Title = "Minimalist Apartment",
                Address = "45 Bulgaria Blvd, Sofia",
                Description = "Clean and minimalist apartment with all necessary amenities.",
                ImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                PricePerMonth = 800,
                CategoryId = dbl,
                UserId = User2Id
            },
            new House
            {
                Title = "Sea View Apartment",
                Address = "10 Coastal Road, Varna",
                Description = "Beautiful apartment with sea view, just minutes from the beach.",
                ImageUrl = "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
                PricePerMonth = 1100,
                CategoryId = family,
                UserId = User2Id
            },
            new House
            {
                Title = "Compact Studio in Plovdiv",
                Address = "12 Kapana District, Plovdiv",
                Description = "Compact studio in the artistic Kapana district.",
                ImageUrl = "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
                PricePerMonth = 550,
                CategoryId = dbl,
                UserId = User2Id
            },
            new House
            {
                Title = "Budget Room",
                Address = "18 Studentski Grad, Sofia",
                Description = "Affordable room suitable for students.",
                ImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                PricePerMonth = 400,
                CategoryId = dbl,
                UserId = User2Id
            }
        );
        await db.SaveChangesAsync();
    }
}
