using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HouseRentingSystemApi.Data.Models;
using HouseRentingSystemApi.Models.Requests;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HouseRentingSystemApi.Controllers;

/// <summary>JWT issuance and account registration.</summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(UserManager<ApplicationUser> users, IConfiguration configuration)
    : ControllerBase
{
    [HttpPost("/login")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SignInAsync([FromBody] SignInRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var account = await users.FindByEmailAsync(request.Email);
        if (account is null)
            return Unauthorized(new { message = "Invalid email or password" });

        var valid = await users.CheckPasswordAsync(account, request.Password);
        if (!valid)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(IssueToken(account));
    }

    [HttpPost("/register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SignUpAsync([FromBody] SignUpRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var duplicate = await users.FindByEmailAsync(request.Email);
        if (duplicate is not null)
            return Conflict(new { message = "An account with this email already exists." });

        var account = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Username
        };

        var created = await users.CreateAsync(account, request.Password);
        if (!created.Succeeded)
            return BadRequest(new { errors = created.Errors.Select(e => e.Description) });

        return Ok();
    }

    private string IssueToken(ApplicationUser user)
    {
        var jwt = configuration.GetSection("Jwt");
        var keyMaterial = jwt["Key"]!;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName!),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName!)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyMaterial));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var lifetime = DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiresMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: lifetime,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
