using Domain;

using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Common.Persistence;

/// <summary>
/// Represents the database context for user-related operations.
/// </summary>
public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
{
    /// <summary>
    /// Gets or sets the DbSet for User entities.
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;
}