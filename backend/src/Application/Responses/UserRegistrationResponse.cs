namespace Application.Responses;

/// <summary>
/// Response for user registration.
/// </summary>
/// <param name="Id">The unique identifier of the registered user.</param>
/// <param name="Email">The email of the registered user.</param>
/// <param name="Token">The authentication token for the user.</param>
public record UserRegistrationResponse(Guid Id, string Email, string Token);