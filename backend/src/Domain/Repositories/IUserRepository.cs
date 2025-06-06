using Domain.Models;

namespace Domain.Repositories;

/// <summary>
/// Interface for user repository.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Creates a new user in the repository.
    /// </summary>
    public Task<User> CreateAsync(User user);

    /// <summary>
    /// Gets all users from the repository.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains a list of users.</returns>
    public Task<IEnumerable<User>> GetAllAsync();
}