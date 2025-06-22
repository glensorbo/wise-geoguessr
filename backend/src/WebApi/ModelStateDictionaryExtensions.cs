using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace WebApi;

/// <summary>
/// Extensions for ModelStateDictionary to add errors.
/// </summary>
public static class ModelStateDictionaryExtensions
{
    /// <summary>
    /// Adds a collection of errors to the ModelStateDictionary.
    /// </summary>
    public static void AddErrors(this ModelStateDictionary modelState, Dictionary<string, string> errors)
    {
        foreach (var error in errors)
        {
            modelState.AddModelError(error.Key, error.Value);
        }
    }
}
