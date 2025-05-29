using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace Contracts.Authentication;

/// <summary>
/// Represents a request for user authentication.
/// </summary>
public class AuthenticationRequest
{
    /// <summary>
    /// Username of the user.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Password of the user.
    /// </summary>
    public string Password { get; set; } = string.Empty;

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
            if (string.IsNullOrEmpty(Username))
            {
                errors.Add(nameof(Username), "Must have a value/can't be null.");
            }

            if (string.IsNullOrEmpty(Password))
            {
                errors.Add(nameof(Password), "Must have a value/can't be null.");
            }

            return errors;
        }
    }

    /// <summary>
    /// Checks if the request is valid.
    /// </summary>
    /// <returns><c>true</c> if request is valid, <c>false</c> otherwise.</returns>
    [MemberNotNullWhen(true, nameof(Username), nameof(Password))]
    public bool IsValid()
    {
        return Errors.Count == 0;
    }
}