using Application.Interfaces;
using Application.Services;

using Microsoft.Extensions.DependencyInjection;

namespace Application;

/// <summary>
/// Dependency injection configuration for the Application layer.
/// </summary>
public static class ApplicationDependencyIncjection
{
    /// <summary>
    /// Application DependencyInjection
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();

        return services;
    }
}