namespace Application.Interfaces;

/// <summary>
/// Interface for authentication services.
/// </summary>
public interface IAuthenticationService
{
    /// <summary>
    /// Authenticates a user with the provided username and password.
    /// </summary>
    /// <param name="username">The username of the user.</param>
    /// <param name="password">The password of the user.</param>
    Task<string> Authenticate(string username, string password);
}