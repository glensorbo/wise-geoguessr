using Application.Interfaces;

using Contracts.Authentication;
using Contracts.Registration;

using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

/// <summary>
/// Controller for handling user authentication and registration.
/// </summary>
[Route("api/auth")]
[ApiController]
public class AuthController(IAuthenticationService authenticationService) : ControllerBase
{
    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="request">The registration request containing username and password.</param>
    [HttpPost("register")]
    [EndpointSummary("Endpoint for user registration")]
    [EndpointDescription("This endpoint allows users to register by providing their username and password.")]
    [ProducesResponseType(typeof(AuthenticationResponse), 200)]
    [ProducesResponseType(400)]
    public ActionResult<AuthenticationResponse> Register([FromBody] RegistrationRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Username and password cannot be empty.");
        }
        // In a real application, you would save the user to a database here
        return Ok(new RegistrationResponse(
          Guid.NewGuid(),
          request.Email,
          "dummy-token from Register"
        ));
    }

    /// <summary>
    /// Authenticates a user.
    /// </summary>
    /// <param name="request">The authentication request containing username and password.</param>
    [HttpPost]
    [EndpointSummary("Endpoint for user login")]
    [EndpointDescription("This endpoint allows users to log in by providing their username and password.")]
    [ProducesResponseType(typeof(AuthenticationResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<AuthenticationResponse>> Authenticate([FromBody] AuthenticationRequest request)
    {
        // if (!request.IsValid())
        // {
        //   ModelState.AddFrom(request.Errors);
        //   return BadRequest(ModelState);
        // }

        if (!request.IsValid())
        {
            return BadRequest("Invalid request. Username and password are required.");
        }

        var res = await authenticationService.Authenticate(request.Username, request.Password).ConfigureAwait(false);

        return Ok(new AuthenticationResponse(
          request.Username,
          res,
          DateTime.UtcNow.AddHours(1)
        ));
    }
}