using HouseRentingSystemApi.Data.Models;

namespace HouseRentingSystemApi.Services;

public interface IAgentService
{
    Task EnsureRoleExistsAsync();
    Task AssignAgentRoleAsync(ApplicationUser user);
    Task<bool> IsAgentAsync(ApplicationUser user);
}
