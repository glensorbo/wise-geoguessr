namespace Contracts.Registration;

/// <summary>
/// Represents a command for user registration.
/// </summary>
public record RegistrationCommand(string Username, string Password);