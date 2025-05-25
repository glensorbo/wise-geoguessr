namespace Application
{
  public class AuthenticationService
  {
    public static string Authenticate(string username, string password)
    {
      // In a real application, you would validate the username and password against a database
      if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
      {
        throw new ArgumentException("Username and password cannot be empty.");
      }
      // For demonstration purposes, we return a dummy token
      return "dummy-token from AuthenticationService";
    }

  }
}

