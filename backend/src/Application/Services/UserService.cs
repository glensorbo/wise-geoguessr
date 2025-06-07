
using Application.Commands;
using Application.Interfaces;
using Application.Responses;

using Domain.Models;
using Domain.Repositories;

using Microsoft.AspNetCore.Identity;

namespace Application.Services;

/// <summary>
/// Service for managing users.
/// </summary>
public class UserService(IUserRepository userRepository) : IUserService
{
    /// <inheritdoc />
    public async Task<UserRegistrationResponse> CreateUserAsync(UserRegistrationCommand command)
    {
        var user = await userRepository
            .GetByEmailAsync(command.Email)
            .ConfigureAwait(false);

        if (user != null)
        {
            throw new InvalidOperationException($"User with email {command.Email} already exists.");
        }

        user = new User()
        {
            Id = Guid.NewGuid(),
            Email = command.Email,
        };

        user.Password = new PasswordHasher<User>()
            .HashPassword(user, command.Password);

        await userRepository
            .CreateAsync(user)
            .ConfigureAwait(false);

        return new UserRegistrationResponse(user.Id, user.Email, "token");
    }

    /// <inheritdoc />
    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await userRepository
            .GetAllAsync()
            .ConfigureAwait(false);
    }
}