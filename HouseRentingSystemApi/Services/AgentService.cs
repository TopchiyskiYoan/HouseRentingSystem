using HouseRentingSystemApi.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace HouseRentingSystemApi.Services;

public sealed class AgentService(
    UserManager<ApplicationUser> users,
    RoleManager<IdentityRole> roles) : IAgentService
{
    public const string AgentRole = "Agent";

    public async Task EnsureRoleExistsAsync()
    {
        if (!await roles.RoleExistsAsync(AgentRole))
            await roles.CreateAsync(new IdentityRole(AgentRole));
    }

    public async Task AssignAgentRoleAsync(ApplicationUser user)
        => await users.AddToRoleAsync(user, AgentRole);

    public async Task<bool> IsAgentAsync(ApplicationUser user)
        => await users.IsInRoleAsync(user, AgentRole);
}
