namespace Application.Commands;

/// <summary>
/// Represents a command for user registration.
/// </summary>
public record UserRegistrationCommand(string Email, string Password);