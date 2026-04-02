using System.ComponentModel.DataAnnotations;

namespace HouseRentingSystemApi.Models.Requests;

public sealed class SignInRequest
{
    [Required]
    [StringLength(20, MinimumLength = 3)]
    public required string Username { get; init; }

    [Required]
    [StringLength(50, MinimumLength = 6)]
    public required string Password { get; init; }

    [Required]
    [EmailAddress]
    public required string Email { get; init; }
}
