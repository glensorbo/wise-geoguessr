using Application.Commands;
using Application.Interfaces;

using Contracts.Registration;

using Domain.Models;

using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

/// <summary>
/// Controller for users.
/// </summary>
[Route("api/user")]
[ApiController]
public class UserController(IUserService userService) : ControllerBase
{
    /// <summary>
    /// Gets all users.
    /// </summary>
    [HttpGet]
    [EndpointSummary("Endpoint for retrieving all users")]
    [EndpointDescription("Endpoint to retrieve a list of all users in the system.")]
    [ProducesResponseType(typeof(IEnumerable<User>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
    {
        var res = await userService
            .GetAllUsersAsync()
            .ConfigureAwait(false);

        return Ok(res);
    }

    /// <summary>
    /// Endpoint for creating a new user.
    /// </summary>
    /// <param name="command">The command containing user registration details.</param>
    /// <returns>A newly created user.</returns>
    [HttpPost]
    [EndpointSummary("Endpoint for creating a new user")]
    [EndpointDescription("Endpoint to create a new user in the system.")]
    [ProducesResponseType(typeof(User), 201)]
    public async Task<ActionResult<RegistrationResponse>> CreateUser([FromBody] RegistrationRequest command)
    {
        var registrationCommand = new UserRegistrationCommand(command.Email, command.Password);
        var createdUser = await userService
            .CreateUserAsync(registrationCommand)
            .ConfigureAwait(false);

        return CreatedAtAction(nameof(CreateUser), new { id = createdUser.Id }, createdUser);
    }
}