namespace Application.Commands;

/// <summary>
/// Represents a command for user registration.
/// </summary>
public class UserRegistrationCommand(string email)
{
    /// <summary>
    /// Gets the email address of the user to register.
    /// </summary>
    public string Email { get; } = email;
}