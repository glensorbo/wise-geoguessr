namespace Contracts.Registration;

/// <summary>
/// Represents a command for user registration.
/// </summary>
public record RegistrationResponse(Guid Id, string Email, string Token);