using HouseRentingSystemApi.Data;
using HouseRentingSystemApi.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRentingSystemApi.Controllers;

/// <summary>CRUD-style access to rental listings backed by <see cref="House"/>.</summary>
[ApiController]
[Route("api/[controller]")]
public sealed class HouseController(AppDbContext database) : ControllerBase
{
    /// <summary>Maps persisted rows to API payloads (no navigation graphs).</summary>
    private static IQueryable<House> ProjectPublic(IQueryable<House> source) =>
        source.Select(h => new House
        {
            Id = h.Id,
            Title = h.Title,
            Address = h.Address,
            Description = h.Description,
            ImageUrl = h.ImageUrl,
            PricePerMonth = h.PricePerMonth,
            CategoryId = h.CategoryId
        });

    [HttpGet("All")]
    [ProducesResponseType(typeof(IReadOnlyList<House>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAllAsync(CancellationToken cancellationToken)
    {
        var list = await ProjectPublic(database.Houses.AsNoTracking())
            .OrderBy(h => h.Id)
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(House), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var row = await ProjectPublic(database.Houses.AsNoTracking())
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

        return row is null ? NotFound() : Ok(row);
    }

    [HttpPost]
    [ProducesResponseType(typeof(House), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] House payload, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var entity = new House
        {
            Title = payload.Title,
            Address = payload.Address,
            Description = string.IsNullOrWhiteSpace(payload.Description)
                ? "TesatDescription"
                : payload.Description,
            ImageUrl = payload.ImageUrl,
            PricePerMonth = payload.PricePerMonth is 0 ? 100m : payload.PricePerMonth,
            CategoryId = payload.CategoryId is 0 ? 1 : payload.CategoryId
        };

        database.Houses.Add(entity);
        await database.SaveChangesAsync(cancellationToken);

        var created = new House
        {
            Id = entity.Id,
            Title = entity.Title,
            Address = entity.Address,
            Description = entity.Description,
            ImageUrl = entity.ImageUrl,
            PricePerMonth = entity.PricePerMonth,
            CategoryId = entity.CategoryId
        };

        return CreatedAtAction(nameof(GetByIdAsync), new { id = entity.Id }, created);
    }
}
