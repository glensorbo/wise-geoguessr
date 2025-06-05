using Application.Interfaces;

namespace Application.Services;

/// <summary>
/// Service for handling user authentication.
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    Task<string> IAuthenticationService.Authenticate(string username, string password)
    {
        throw new NotImplementedException();
    }
}