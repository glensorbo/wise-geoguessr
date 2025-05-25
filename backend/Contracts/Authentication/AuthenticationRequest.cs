namespace Contracts.Authentication
{
  public class AuthenticationRequest
  {
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public bool IsValid()
    {
      return !string.IsNullOrEmpty(Username) && !string.IsNullOrEmpty(Password);
    }
  }
}

