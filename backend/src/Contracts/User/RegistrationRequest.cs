using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace Contracts.User;

/// <summary>
/// Represents a command for user registration.
/// </summary>
public class RegistrationRequest()
{
    /// <summary>
    /// Gets or sets the email of the user to register.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the password for the user to register.
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the confirmation password for the user to register.
    /// </summary>
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>
    /// Validation errors.
    /// Key is name of property, and value is reason.
    /// </summary>
    [JsonIgnore]
    public Dictionary<string, string> Errors
    {
        get
        {
            var errors = new Dictionary<string, string>();

            if (string.IsNullOrEmpty(Email))
            {
                errors.Add(nameof(Email), "Must have a value/can't be null.");
            }

            if (string.IsNullOrEmpty(Password))
            {
                errors.Add(nameof(Password), "Must have a value/can't be null.");
            }

            if (string.IsNullOrEmpty(ConfirmPassword))
            {
                errors.Add(nameof(ConfirmPassword), "Must have a value/can't be null.");
            }

            if (Password != ConfirmPassword)
            {
                errors.Add(nameof(ConfirmPassword), "Passwords do not match.");
            }

            return errors;
        }
    }

    /// <summary>
    /// Returns true if the registration request is valid, otherwise false.
    /// </summary>
    [MemberNotNullWhen(true, nameof(Email), nameof(Password), nameof(ConfirmPassword))]
    public bool IsValid()
    {
        return Errors.Count == 0;
    }
}