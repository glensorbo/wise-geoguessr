using Infrastructure;
using Application;

using Scalar.AspNetCore;

using WebApi;

var builder = WebApplication.CreateBuilder(args);

{
    builder.Services
        .AddPresentation(builder.Configuration)
        .AddApplication()
        .AddInfrastructure(builder.Configuration);
}

var app = builder.Build();

{
    app.UseExceptionHandler();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseHttpsRedirection();
    app.MapControllers();

    app.Run();
}