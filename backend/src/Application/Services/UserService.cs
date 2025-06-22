using Application.Commands;
using Application.Interfaces;
using Domain.Models;
using Domain.Repositories;

namespace Application.Services;

/// <summary>
/// Service for managing users.
/// </summary>
public class UserService(IUserRepository userRepository) : IUserService
{
    /// <inheritdoc />
    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await userRepository
            .GetAllAsync()
            .ConfigureAwait(false);
    }

    /// <inheritdoc />
    public Task InviteUser(UserRegistrationCommand userRegistrationCommand)
    {
        throw new NotImplementedException();
    }
}
