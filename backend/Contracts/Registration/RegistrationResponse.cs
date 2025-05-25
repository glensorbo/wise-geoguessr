namespace Contracts.Registration
{
  public record RegistrationResponse(Guid Id,
                                     string Username,
                                     string Token);
}
