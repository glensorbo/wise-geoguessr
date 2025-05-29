using Infrastructure;

using Scalar.AspNetCore;

using WebApi;

var builder = WebApplication.CreateBuilder(args);

{
    builder.Services
        .AddPresentation()
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