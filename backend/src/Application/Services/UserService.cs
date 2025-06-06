
using Application.Commands;
using Application.Interfaces;
using Application.Responses;

using Domain.Models;
using Domain.Repositories;

namespace Application.Services;

/// <summary>
/// Service for managing users.
/// </summary>
public class UserService(IUserRepository userRepository) : IUserService
{
    /// <inheritdoc />
    public async Task<UserRegistrationResponse> CreateUserAsync(UserRegistrationCommand command)
    {
        var user = await userRepository.CreateAsync(
            new User()
            {
                Email = command.Email,
                Password = command.Password
            }).ConfigureAwait(false);

        return new UserRegistrationResponse(
                Guid.NewGuid(),
        user.Email,
        "sdf");
    }

    /// <inheritdoc />
    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await userRepository
            .GetAllAsync()
            .ConfigureAwait(false);
    }
}