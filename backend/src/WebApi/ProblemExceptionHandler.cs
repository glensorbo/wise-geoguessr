using Domain.Exceptions;

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace WebApi;

/// <summary>
/// Handles exceptions and customizes problem details for HTTP responses.
/// </summary>
public class ProblemExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService = problemDetailsService;

    /// <summary>
    /// Handles exceptions and customizes problem details for HTTP responses.
    /// </summary>
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext,
                                                Exception exception,
                                                CancellationToken cancellationToken)
    {
        var (statusCode, problemDetails) = GetProblemDetails(exception);

        httpContext.Response.StatusCode = statusCode;

        return await _problemDetailsService.TryWriteAsync(
                    new ProblemDetailsContext
                    {
                        HttpContext = httpContext,
                        ProblemDetails = problemDetails,
                    }
                ).ConfigureAwait(false);
    }

    private static (int, ProblemDetails) GetProblemDetails(Exception exception)
    {
        var statusCode = exception switch
        {
            BadRequestException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError,
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = exception.Source,
            Detail = exception.Message,
            Type = "Bad Request"
        };
        return (statusCode, problemDetails);
    }
}