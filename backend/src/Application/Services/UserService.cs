using Domain.Models;
using Domain.Repositories;

namespace Application.Services;

/// <summary>
/// Service for managing users.
/// </summary>
public class UserService(IUserRepository userRepository)
{
    /// <summary>
    /// Gets all users from the repository.
    /// </summary>
    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await userRepository.GetAllAsync().ConfigureAwait(false);
    }
}