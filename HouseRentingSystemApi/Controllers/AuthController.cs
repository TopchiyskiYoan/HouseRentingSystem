using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HouseRentingSystemApi.Data.Models;
using HouseRentingSystemApi.Models.Auth;
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
    [Produces(typeof(AuthResult))]
    public async Task<IActionResult> SignInAsync([FromBody] AuthModel model)
    {
        if (!ModelState.IsValid)
        {
            var allErrors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToArray();

            return BadRequest(PopulateResult(400, null, allErrors));
        }

        var account = await users.FindByEmailAsync(model.Email);
        if (account is null)
            return Unauthorized(PopulateResult(400, null, "Invalid email or password"));

        var valid = await users.CheckPasswordAsync(account, model.Password);
        if (!valid)
            return Unauthorized(PopulateResult(400, null, "Invalid email or password"));

        var token = IssueToken(account);
        return Ok(PopulateResult(200, token, "User logged in successfully"));
    }

    [HttpPost("/register")]
    [Produces(typeof(AuthResult))]
    public async Task<IActionResult> SignUpAsync([FromBody] AuthModel model)
    {
        if (!ModelState.IsValid)
        {
            var allErrors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToArray();

            return BadRequest(PopulateResult(400, null, allErrors));
        }

        var duplicate = await users.FindByEmailAsync(model.Email);
        if (duplicate is not null)
            return BadRequest(PopulateResult(400, null, "User already exists"));

        var account = new ApplicationUser
        {
            Email = model.Email,
            UserName = model.Username
        };

        var created = await users.CreateAsync(account, model.Password);
        if (created.Succeeded)
            return Ok(PopulateResult(200, null, "User registered successfully"));

        return BadRequest(PopulateResult(
            400,
            null,
            created.Errors.Select(e => e.Description).ToArray()));
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

    private AuthResult PopulateResult(int code, string? token = null, params string[] messages)
    {
        var result = new AuthResult();
        result.Code = code;
        result.Message = string.Join(Environment.NewLine, messages);
        if (token != null)
        {
            result.Token = token;
        }
        return result;
    }
}
