using chat_app_backend.Hubs;

var builder = WebApplication.CreateBuilder(args);

// HTTP & HTTPS
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(5135);
        options.ListenAnyIP(7176, listenOptions =>
        {
            listenOptions.UseHttps();
        });
    });
}

builder.Services.AddOpenApi();
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigin", builder =>
        {
            builder.WithOrigins("http://localhost:5173", "https://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials(); ;
        });
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");

app.MapHub<ChatHub>("/chathub");

app.Run();

