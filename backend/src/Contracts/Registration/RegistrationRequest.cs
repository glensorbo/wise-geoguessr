namespace Contracts.Registration;

/// <summary>
/// Represents a command for user registration.
/// </summary>
public record RegistrationRequest(string Email, string Password);