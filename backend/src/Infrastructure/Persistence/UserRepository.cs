
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
    public async Task CreateAsync(User user)
    {
        await context.AddAsync(user).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await context.Users.ToListAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.Email == email)
            .ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.Id == id)
            .ConfigureAwait(false);
    }
}