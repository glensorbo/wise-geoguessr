
using Domain.Models;
using Domain.Repositories;

using Infrastructure.Common.Persistence;

using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

/// <summary>
/// User repository for managing user data.
/// </summary>
public class UserRepository(UserContext context) : IUserRepository
{
    /// <inheritdoc />
    public Task<User> CreateAsync(User user)
    {
        throw new NotImplementedException();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await context.Users.ToListAsync().ConfigureAwait(false);
    }
}