using Domain.Models;

namespace Domain.Repositories;

/// <summary>
/// Interface for user repository.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Gets a user by their unique identifier.
    /// </summary>
    public Task<User?> GetByIdAsync(Guid id);

    /// <summary>
    /// Creates a new user in the repository.
    /// </summary>
    public Task CreateAsync(User user);

    /// <summary>
    /// Gets all users from the repository.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains a list of users.</returns>
    public Task<IEnumerable<User>> GetAllAsync();

    /// <summary>
    /// Get a user by their unique email.
    /// </summary>
    public Task<User?> GetByEmailAsync(string email);
}