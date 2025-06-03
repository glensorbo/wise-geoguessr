using Application.Interfaces;

namespace Application.Services;

/// <summary>
/// Service for handling user authentication.
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    /// <inheritdoc />
    Task Authenticate(string username, string password)
    {
        // In a real application, you would validate the username and password against a database
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("Username and password cannot be empty.");
        }
        // For demonstration purposes, we return a dummy token
        return Task.CompletedTask;
    }
}