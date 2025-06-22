namespace WebApi.Exceptions;

/// <summary>
/// Represents an exception that is thrown when a bad request is made.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="BadRequestException"/> class with a specified error and message.
/// </remarks>
/// <param name="message">The error code associated with the bad request.</param>
#pragma warning disable CA1032 // Implement exception constructors
#pragma warning disable RCS1194 // Implement exception constructors
public class BadRequestException(string message) : Exception(message)
{
}
