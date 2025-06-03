using Domain.Models;

namespace Application.Interfaces;

/// <summary>
/// Interface for user-related services.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Gets all users from the repository.
    /// </summary>
    Task<IEnumerable<User>> GetAllUsersAsync();
}