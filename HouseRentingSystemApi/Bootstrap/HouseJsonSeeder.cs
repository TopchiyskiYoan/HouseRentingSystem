using System.Text.Json;
using HouseRentingSystemApi.Data;
using HouseRentingSystemApi.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseRentingSystemApi.Bootstrap;

/// <summary>
/// Loads demo houses from <c>SeedData/houses.json</c>.
/// Inserts when the table is empty; otherwise refreshes existing rows when they look outdated.
/// </summary>
public static class HouseJsonSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    public static async Task ApplyAsync(WebApplication app, CancellationToken cancellationToken = default)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();

        var path = Path.Combine(env.ContentRootPath, "SeedData", "houses.json");
        if (!File.Exists(path))
            return;

        var json = await File.ReadAllTextAsync(path, cancellationToken);
        var rows = JsonSerializer.Deserialize<List<HouseSeedRow>>(json, JsonOptions);
        if (rows is null || rows.Count == 0)
            return;

        if (!await db.Categories.AnyAsync(cancellationToken))
        {
            db.Categories.Add(new Category { Name = "Наеми" });
            await db.SaveChangesAsync(cancellationToken);
        }

        var categoryIds = await db.Categories.Select(c => c.Id).ToListAsync(cancellationToken);
        var fallbackCategoryId = categoryIds.Min();

        var hasAny = await db.Houses.AnyAsync(cancellationToken);
        if (!hasAny)
        {
            foreach (var row in rows)
            {
                var categoryId = categoryIds.Contains(row.CategoryId) ? row.CategoryId : fallbackCategoryId;

                db.Houses.Add(new House
                {
                    Title = row.Title,
                    Address = row.Address,
                    Description = row.Description,
                    ImageUrl = row.ImageUrl,
                    PricePerMonth = row.PricePerMonth,
                    Kind = row.Kind,
                    CategoryId = categoryId
                });
            }

            await db.SaveChangesAsync(cancellationToken);
            return;
        }

        // Refresh mode: update previously seeded rows (e.g. when image URLs were changed in JSON).
        var looksOutdated = await db.Houses.AnyAsync(
            h => h.ImageUrl.Contains("source.unsplash.com"),
            cancellationToken);

        if (!looksOutdated)
            return;

        var existing = await db.Houses.OrderBy(h => h.Id).ToListAsync(cancellationToken);
        var count = Math.Min(existing.Count, rows.Count);

        for (var i = 0; i < count; i++)
        {
            var row = rows[i];
            var entity = existing[i];
            var categoryId = categoryIds.Contains(row.CategoryId) ? row.CategoryId : fallbackCategoryId;

            entity.Title = row.Title;
            entity.Address = row.Address;
            entity.Description = row.Description;
            entity.ImageUrl = row.ImageUrl;
            entity.PricePerMonth = row.PricePerMonth;
            entity.Kind = row.Kind;
            entity.CategoryId = categoryId;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private sealed class HouseSeedRow
    {
        public string Title { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal PricePerMonth { get; set; }
        public PropertyKind Kind { get; set; }
        public int CategoryId { get; set; }
    }
}
