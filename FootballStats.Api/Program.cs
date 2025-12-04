using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;

var builder = WebApplication.CreateBuilder(args);

// CORS beállítás
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// Swagger + API explorer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger UI dev módban
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Connection string beolvasása appsettings.json-ból
var connectionString = builder.Configuration.GetConnectionString("FootballDwh");

// TESZT ENDPOINT: GET /api/leagues  --> v_LeagueSummary
app.MapGet("/api/leagues", async () =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var sql = "SELECT * FROM v_LeagueSummary";  // ezt a view-t már létrehoztuk SQL-ben
    var leagues = await conn.QueryAsync(sql);

    return Results.Ok(leagues);
});

// GET /api/leagues/{competitionId}/teams
app.MapGet("/api/leagues/{competitionId}/teams", async (int competitionId) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var sql = @"
        SELECT DISTINCT 
            TeamKey,
            TeamName
        FROM v_TeamSquad
        WHERE CompetitionKey = @competitionId
        ORDER BY TeamName;
    ";

    var teams = await conn.QueryAsync(sql, new { competitionId });

    return Results.Ok(teams);
});

// GET /api/teams/{teamId}/players
app.MapGet("/api/teams/{teamId}/players", async (int teamId) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var sql = @"
        SELECT *
        FROM v_TeamSquad
        WHERE TeamKey = @teamId
        ORDER BY PositionCode, PlayerName;
    ";

    var players = await conn.QueryAsync(sql, new { teamId });

    return Results.Ok(players);
});

// GET /api/player/{playerId}
app.MapGet("/api/player/{playerId}", async (int playerId) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var sql = @"
        SELECT *
        FROM v_PlayerSummary
        WHERE PlayerKey = @playerId;
    ";

    var player = await conn.QueryFirstOrDefaultAsync(sql, new { playerId });

    if (player == null)
        return Results.NotFound();

    return Results.Ok(player);
});

// GET /api/goalkeepers?competitionId=3
app.MapGet("/api/goalkeepers", async (int competitionId) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var sql = @"
        SELECT *
        FROM v_GoalkeeperSummary
        WHERE CompetitionKey = @competitionId
        ORDER BY PSxG_PlusMinus_per90 DESC;
    ";

    var goalkeepers = await conn.QueryAsync(sql, new { competitionId });

    return Results.Ok(goalkeepers);
});

app.Run();
