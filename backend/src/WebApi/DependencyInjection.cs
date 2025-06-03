namespace WebApi;

/// <summary>
/// Dependency injection configuration for the WebApi layer.
/// </summary>
public static class WebApiDependencyInjection
{
    /// <summary>
    /// WebApi DependencyInjection
    /// </summary>
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddScalar();
        services.AddControllers();
        services.AddProblemDetails();

        return services;
    }

    private static IServiceCollection AddScalar(this IServiceCollection services)
    {
        services.AddOpenApi(opt => opt.AddDocumentTransformer((doc, _, __) =>
            {
                doc.Info = new()
                {
                    Title = "WiseGeoguessr API",
                    Version = "v1",
                    Description = "API for the WiseGeoguessr application, providing endpoints for user authentication and game management.",
                    Contact = new()
                    {
                        Name = "WiseGeoguessr Team"
                    }
                };

                return Task.CompletedTask;
            }));

        return services;
    }
}