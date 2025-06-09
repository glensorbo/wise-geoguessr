using Microsoft.AspNetCore.Http.Features;

using Serilog;
using Serilog.Sinks.OpenTelemetry;

namespace WebApi;

/// <summary>
/// Dependency injection configuration for the WebApi layer.
/// </summary>
public static class WebApiDependencyInjection
{
    /// <summary>
    /// WebApi DependencyInjection
    /// </summary>
    public static IServiceCollection AddPresentation(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSerilog(configuration);
        services.AddScalar();
        services.AddControllers();
        services.AddProblemDetails(o => o.CustomizeProblemDetails = context =>
                    {
                        context.ProblemDetails.Instance = $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
                        context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);

                        var activity = context.HttpContext.Features.Get<IHttpActivityFeature>()?.Activity;
                        context.ProblemDetails.Extensions.TryAdd("traceId", activity?.Id);
                    });
        services.AddExceptionHandler<ProblemExceptionHandler>();

        return services;
    }

    private static IServiceCollection AddSerilog(this IServiceCollection services, IConfiguration configuration)
    {
        var logger = new LoggerConfiguration();

        logger.Enrich.FromLogContext();

        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
        {
            logger.WriteTo.Console();
        }

        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production")
        {
            logger.WriteTo.OpenTelemetry(x =>
            {
                x.Endpoint = configuration["Seq:Endpoint"] ?? string.Empty;
                x.Protocol = OtlpProtocol.HttpProtobuf;
                x.Headers = new Dictionary<string, string>
                {
                            { "X-Seq-ApiKey", configuration["Seq:ApiKey"] ?? string.Empty }
                };
                x.ResourceAttributes = new Dictionary<string, object>
                {
                            { "service.name", "WebApi" },
                            { "service.version", "1.0.0" },
                            { "service.instance.id", Environment.MachineName }
                };
            });
        }

        Log.Logger = logger.CreateLogger();

        services.AddSerilog();

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
                        Name = "WiseGeoguessr Team",
                        Email = "glen.sorbo@bouvet.no"
                    }
                };

                return Task.CompletedTask;
            }));

        return services;
    }
}