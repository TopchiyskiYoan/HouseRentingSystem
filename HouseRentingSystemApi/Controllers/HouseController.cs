using HouseRentingSystemApi.Data;
using HouseRentingSystemApi.Data.Models;
using HouseRentingSystemApi.Models;
using HouseRentingSystemApi.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HouseRentingSystemApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HouseController(AppDbContext database) : ControllerBase
{
    [HttpGet("All")]
    [ProducesResponseType(typeof(IEnumerable<HouseDetailModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAllAsync(CancellationToken cancellationToken)
    {
        var model = await database.Houses
            .AsNoTracking()
            .Select(h => new HouseDetailModel
            {
                Id = h.Id,
                Title = h.Title,
                Address = h.Address,
                ImageUrl = h.ImageUrl,
                Description = h.Description,
                PricePerMonth = h.PricePerMonth,
                UserId = h.UserId
            })
            .ToListAsync(cancellationToken);

        return Ok(model);
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var isAuthenticated = User.Identity?.IsAuthenticated;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(new { isAuthenticated, userId });
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(HouseDetailModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var house = await database.Houses
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

        if (house is null)
            return NotFound();

        return Ok(new HouseDetailModel
        {
            Id = house.Id,
            Title = house.Title,
            Address = house.Address,
            ImageUrl = house.ImageUrl,
            Description = house.Description,
            PricePerMonth = house.PricePerMonth,
            UserId = house.UserId
        });
    }

    [Authorize]
    [HttpPost("All")]
    [ProducesResponseType(typeof(HouseDetailModel), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] HouseDetailModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var newHouse = new House
        {
            Title = model.Title,
            Address = model.Address,
            Description = model.Description,
            ImageUrl = model.ImageUrl,
            PricePerMonth = model.PricePerMonth,
            UserId = userId
        };

        var category = await database.Categories
            .FirstOrDefaultAsync(c => c.Name == model.Category.ToString(), cancellationToken);

        if (category is null)
        {
            var newCategory = new Category { Name = model.Category.ToString() };
            database.Categories.Add(newCategory);
            await database.SaveChangesAsync(cancellationToken);
            newHouse.CategoryId = newCategory.Id;
        }
        else
        {
            newHouse.CategoryId = category.Id;
        }

        database.Houses.Add(newHouse);
        await database.SaveChangesAsync(cancellationToken);

        return Created($"api/house/{newHouse.Id}", new HouseDetailModel
        {
            Title = newHouse.Title,
            Address = newHouse.Address,
            ImageUrl = newHouse.ImageUrl,
            Description = newHouse.Description,
            PricePerMonth = newHouse.PricePerMonth,
            Category = model.Category,
            UserId = newHouse.UserId
        });
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(HouseDetailModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EditAsync(int id, [FromBody] HouseDetailModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest();

        var house = await database.Houses.FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
        if (house is null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (house.UserId != userId)
            return Forbid();

        house.Title = model.Title;
        house.Address = model.Address;
        house.Description = model.Description;
        house.ImageUrl = model.ImageUrl;
        house.PricePerMonth = model.PricePerMonth;

        var category = await database.Categories
            .FirstOrDefaultAsync(c => c.Name == model.Category.ToString(), cancellationToken);

        if (category is null)
        {
            var newCategory = new Category { Name = model.Category.ToString() };
            database.Categories.Add(newCategory);
            await database.SaveChangesAsync(cancellationToken);
            house.CategoryId = newCategory.Id;
        }
        else
        {
            house.CategoryId = category.Id;
        }

        await database.SaveChangesAsync(cancellationToken);

        return Ok(new HouseDetailModel
        {
            Title = house.Title,
            Address = house.Address,
            ImageUrl = house.ImageUrl,
            Description = house.Description,
            PricePerMonth = house.PricePerMonth,
            Category = model.Category,
            UserId = house.UserId
        });
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var house = await database.Houses.FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
        if (house is null)
            return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (house.UserId != userId)
            return Forbid();

        database.Houses.Remove(house);
        await database.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
