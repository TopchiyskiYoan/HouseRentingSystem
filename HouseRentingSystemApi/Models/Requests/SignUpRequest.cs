using System.ComponentModel.DataAnnotations;

namespace HouseRentingSystemApi.Models.Requests;

public sealed class SignUpRequest
{
    [Required]
    public required string Username { get; init; }

    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public required string Password { get; init; }
}
