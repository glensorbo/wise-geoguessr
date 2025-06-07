namespace Contracts.Authentication;

/// <summary>
/// Represents a response for user authentication.
/// </summary>
public record AuthenticationResponse(string Username, string Token, DateTime Expiration);