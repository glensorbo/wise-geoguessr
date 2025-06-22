using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using Application.Commands;

namespace Contracts.User;

/// <summary>
/// Represents a request to invite a user.
/// </summary>
public class InvitationRequest
{
    /// <summary>
    /// Email address of the user to invite.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Validation errors.
    /// </summary>
    [JsonIgnore]
    public Dictionary<string, string> Errors
    {
        get
        {
            var errors = new Dictionary<string, string>();

            if (string.IsNullOrWhiteSpace(Email))
            {
                errors.Add(nameof(Email), "Email must have a value and cannot be null or whitespace.");
            }
            return errors;
        }
    }

    /// <summary>
    /// Checks if the invitation request is valid.
    /// </summary>
    ///  <returns>True if the request is valid, otherwise false.</returns>
    [MemberNotNullWhen(true, nameof(Email))]
    public bool IsValid()
    {
        return Errors.Count == 0;
    }

    /// <summary>
    /// Creates a command for user registration based on the request.
    /// </summary>
    public UserRegistrationCommand AsCommand()
    {
        return new UserRegistrationCommand(Email);
    }
}
