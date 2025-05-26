namespace Contracts.Authentication
{
  public class AuthenticationRequest
  {
    public string Username { get; set; } = string.Empty;
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
        if (string.isnullOrEmpty(Username))
        {
          errors.Add(nameof(Username), $"Must have a value/can't be null.");
        }

        if (string.isnullOrEmpty(Password))
        {
          errors.Add(nameof(Password), $"Must have a value/can't be null.");
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
}

