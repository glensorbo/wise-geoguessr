using Domain.Repositories;

using Infrastructure.Common.Persistence;
using Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

/// <summary>
/// Dependency injection configuration for the Infrastructure layer.
/// </summary>
public static class InfrastructureDependencyInjection
{
    /// <summary>
    /// Infrastructure DependencyInjection
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddPersistence(configuration);

        return services;
    }
    private static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<UserContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("Database")));

        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}