namespace WebApi;

/// <summary>
/// Dependency injection configuration for the API layer.
/// </summary>
public static class WebApiDependencyInjection
{
    /// <summary>
    /// API DependencyInjection
    /// </summary>
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddControllers();

        return services;
    }
}