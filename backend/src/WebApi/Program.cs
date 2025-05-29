using Scalar.AspNetCore;
using Infrastructure;
using WebApi;

var builder = WebApplication.CreateBuilder(args);

{
    builder.Services
        .AddPresentation()
        .AddInfrastructure(builder.Configuration);
}

// builder.Services.AddControllers();

builder.Services.AddOpenApi(opt => opt.AddDocumentTransformer((doc, context, cancellationToken) =>
    {
        doc.Info = new()
        {
            Title = "WiseGeoguessr API",
            Version = "v1",
            Description = "API for the WiseGeoguessr application, providing endpoints for user authentication and game management.",
            Contact = new()
            {
                Name = "WiseGeoguessr Team"
            }
        };

        return Task.CompletedTask;
    }));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();