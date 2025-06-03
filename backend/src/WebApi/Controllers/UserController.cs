using Application.Services;

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
}