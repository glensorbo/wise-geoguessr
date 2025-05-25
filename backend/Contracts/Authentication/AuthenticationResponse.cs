namespace Contracts.Authentication
{
  public record AuthenticationResponse(string Username,
                                       string Token,
                                       DateTime Expiration);
}

