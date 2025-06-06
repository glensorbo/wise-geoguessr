using Application.Commands;
using Application.Responses;

using Domain.Models;

namespace Application.Interfaces;

/// <summary>
/// Interface for user-related services.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Creates a new user in the repository.
    /// </summary>
    Task<UserRegistrationResponse> CreateUserAsync(UserRegistrationCommand command);

    /// <summary>
    /// Gets all users from the repository.
    /// </summary>
    Task<IEnumerable<User>> GetAllUsersAsync();
}