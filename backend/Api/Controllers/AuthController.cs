using Application;
using Contracts.Authentication;
using Contracts.Registration;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
  [Route("api/auth")]
  [ApiController]
  public class AuthController() : ControllerBase
  {
    [HttpPost("register")]
    [EndpointSummary("Endpoint for user registration")]
    [EndpointDescription("This endpoint allows users to register by providing their username and password.")]
    [ProducesResponseType(typeof(AuthenticationResponse), 200)]
    [ProducesResponseType(400)]
    public ActionResult<AuthenticationResponse> Register([FromBody] RegistrationCommand request)
    {
      if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
      {
        return BadRequest("Username and password cannot be empty.");
      }
      // In a real application, you would save the user to a database here
      return Ok(new RegistrationResponse(
        Guid.NewGuid(),
        request.Username,
        "dummy-token from Register"
      ));
    }

    [HttpPost]
    [EndpointSummary("Endpoint for user login")]
    [EndpointDescription("This endpoint allows users to log in by providing their username and password.")]
    [ProducesResponseType(typeof(AuthenticationResponse), 200)]
    [ProducesResponseType(400)]
    public ActionResult<AuthenticationResponse> Authenticate([FromBody] AuthenticationRequest request)
    {
      if (!request.IsValid())
      {
        return BadRequest("Invalid request. Username and password are required.");
      }
      if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
      {
        return BadRequest("Username and password cannot be empty.");
      }
      var res = AuthenticationService.Authenticate(request.Username, request.Password);
      return Ok(new AuthenticationResponse(
        request.Username,
        res,
        DateTime.UtcNow.AddHours(1)
      ));
    }
  }
}

