-- FootballDWH - Clean schema (core DWH model)
-- Only final dimension tables, fact table and analytic views.
-- No CREATE DATABASE, no server-specific settings.

------------------------------------------------------------
-- DIMENSIONS
------------------------------------------------------------

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Competition dimension (league)
CREATE TABLE dbo.dim_Competition_v2 (
    CompetitionKey  INT IDENTITY(1,1) NOT NULL,
    CompetitionName NVARCHAR(255)     NOT NULL,
    Country         NVARCHAR(100)     NULL,
    [Level]         NVARCHAR(50)      NULL,
    CONSTRAINT PK_dim_Competition_v2
        PRIMARY KEY CLUSTERED (CompetitionKey ASC)
);
GO

-- Team dimension
CREATE TABLE dbo.dim_Team_v2 (
    TeamKey        INT IDENTITY(1,1) NOT NULL,
    TeamName       NVARCHAR(255)     NOT NULL,
    CompetitionKey INT               NOT NULL,
    CONSTRAINT PK_dim_Team_v2
        PRIMARY KEY CLUSTERED (TeamKey ASC)
);
GO

-- Player dimension
CREATE TABLE dbo.dim_Player_v2 (
    PlayerKey    INT IDENTITY(1,1) NOT NULL,
    PlayerName   NVARCHAR(255)     NOT NULL,
    Nation       NVARCHAR(50)      NULL,
    PositionCode NVARCHAR(10)      NULL,
    BornYear     INT               NULL,
    AgeAtSeason  INT               NULL,
    CONSTRAINT PK_dim_Player_v2
        PRIMARY KEY CLUSTERED (PlayerKey ASC)
);
GO

-- Season dimension
CREATE TABLE dbo.dim_Season_v2 (
    SeasonKey  INT IDENTITY(1,1) NOT NULL,
    SeasonName NVARCHAR(50)      NOT NULL,
    StartYear  INT               NULL,
    EndYear    INT               NULL,
    CONSTRAINT PK_dim_Season_v2
        PRIMARY KEY CLUSTERED (SeasonKey ASC)
);
GO

-- Position dimension (used by Fact.PositionKey)
CREATE TABLE dbo.dim_Position (
    PositionKey  INT IDENTITY(1,1) NOT NULL,
    PositionCode NVARCHAR(10)      NOT NULL,
    PositionName NVARCHAR(50)      NOT NULL,
    CONSTRAINT PK_dim_Position
        PRIMARY KEY CLUSTERED (PositionKey ASC)
);
GO

------------------------------------------------------------
-- FACT TABLE
------------------------------------------------------------

CREATE TABLE dbo.fact_PlayerSeasonStats_Full (
    PlayerSeasonStatsKey BIGINT IDENTITY(1,1) NOT NULL,
    PlayerKey            INT                  NOT NULL,
    TeamKey              INT                  NOT NULL,
    CompetitionKey       INT                  NOT NULL,
    SeasonKey            INT                  NOT NULL,
    PositionKey          INT                  NOT NULL,

    MP               SMALLINT       NULL,
    Starts           SMALLINT       NULL,
    Minutes          INT            NULL,
    NinetyMins       DECIMAL(6, 2)  NULL,

    Gls              SMALLINT       NULL,
    Ast              SMALLINT       NULL,
    GplusA           SMALLINT       NULL,
    GminusPK         SMALLINT       NULL,
    PKGoals          SMALLINT       NULL,
    PKatt            SMALLINT       NULL,
    YellowCards      SMALLINT       NULL,
    RedCards         SMALLINT       NULL,

    Shots            SMALLINT       NULL,
    ShotsOnTarget    SMALLINT       NULL,
    xG               DECIMAL(6, 2)  NULL,
    npxG             DECIMAL(6, 2)  NULL,
    xAG              DECIMAL(6, 2)  NULL,
    npxGplusxAG      DECIMAL(6, 2)  NULL,

    SCA              SMALLINT       NULL,
    SCA90            DECIMAL(6, 2)  NULL,
    GCA              SMALLINT       NULL,
    GCA90            DECIMAL(6, 2)  NULL,

    Tackles          SMALLINT       NULL,
    TacklesWon       SMALLINT       NULL,
    TacklesPlusInt   SMALLINT       NULL,
    Interceptions    SMALLINT       NULL,
    Blocks           SMALLINT       NULL,
    Clearances       SMALLINT       NULL,

    Touches          INT            NULL,
    Carries          INT            NULL,
    ProgCarries      INT            NULL,
    ProgPasses       INT            NULL,
    ProgRecep        INT            NULL,

    GA               SMALLINT       NULL,
    GA90             DECIMAL(6, 2)  NULL,
    SoTA             SMALLINT       NULL,
    Saves            SMALLINT       NULL,
    SavePct          DECIMAL(5, 2)  NULL,
    CS               SMALLINT       NULL,
    CSpercent        DECIMAL(5, 2)  NULL,
    PKsv             SMALLINT       NULL,
    PKm              SMALLINT       NULL,
    PSxG             DECIMAL(6, 2)  NULL,
    PSxG_SoT         DECIMAL(6, 2)  NULL,
    PSxG_PlusMinus   DECIMAL(6, 2)  NULL,

    CONSTRAINT PK_fact_PlayerSeasonStats_Full
        PRIMARY KEY CLUSTERED (PlayerSeasonStatsKey ASC)
);
GO

------------------------------------------------------------
-- FOREIGN KEYS
------------------------------------------------------------

ALTER TABLE dbo.dim_Team_v2
    ADD CONSTRAINT FK_dim_Team_v2_Competition
        FOREIGN KEY (CompetitionKey)
        REFERENCES dbo.dim_Competition_v2 (CompetitionKey);
GO

ALTER TABLE dbo.fact_PlayerSeasonStats_Full
    ADD CONSTRAINT FK_Full_Player
        FOREIGN KEY (PlayerKey)
        REFERENCES dbo.dim_Player_v2 (PlayerKey);
GO

ALTER TABLE dbo.fact_PlayerSeasonStats_Full
    ADD CONSTRAINT FK_Full_Team
        FOREIGN KEY (TeamKey)
        REFERENCES dbo.dim_Team_v2 (TeamKey);
GO

ALTER TABLE dbo.fact_PlayerSeasonStats_Full
    ADD CONSTRAINT FK_Full_Competition
        FOREIGN KEY (CompetitionKey)
        REFERENCES dbo.dim_Competition_v2 (CompetitionKey);
GO

ALTER TABLE dbo.fact_PlayerSeasonStats_Full
    ADD CONSTRAINT FK_Full_Season
        FOREIGN KEY (SeasonKey)
        REFERENCES dbo.dim_Season_v2 (SeasonKey);
GO

ALTER TABLE dbo.fact_PlayerSeasonStats_Full
    ADD CONSTRAINT FK_Full_Position
        FOREIGN KEY (PositionKey)
        REFERENCES dbo.dim_Position (PositionKey);
GO

------------------------------------------------------------
-- ANALYTIC VIEWS
------------------------------------------------------------

-- Squad-level view (team + players with stats)
CREATE VIEW dbo.v_TeamSquad AS
SELECT
    t.TeamKey,
    t.TeamName,
    c.CompetitionKey,
    c.CompetitionName,

    p.PlayerKey,
    p.PlayerName,
    p.PositionCode,
    p.Nation,
    p.BornYear,
    p.AgeAtSeason,

    -- base
    f.MP,
    f.Starts,
    f.Minutes,
    f.NinetyMins,

    -- attacking
    f.Gls,
    f.Ast,
    f.GplusA,
    f.xG,
    f.npxG,
    f.xAG,
    f.npxGplusxAG,

    -- creativity
    f.SCA,
    f.SCA90,
    f.GCA,
    f.GCA90,

    -- defending
    f.Tackles,
    f.TacklesWon,
    f.TacklesPlusInt,
    f.Interceptions,
    f.Blocks,
    f.Clearances,

    -- progression / possession
    f.Touches,
    f.Carries,
    f.ProgCarries,
    f.ProgPasses,
    f.ProgRecep,

    -- goalkeeper stats (relevant for GK only)
    f.GA,
    f.GA90,
    f.SoTA,
    f.Saves,
    f.SavePct,
    f.CS,
    f.CSpercent,
    f.PKsv,
    f.PKm,
    f.PSxG,
    f.PSxG_SoT,
    f.PSxG_PlusMinus
FROM dbo.fact_PlayerSeasonStats_Full      AS f
JOIN dbo.dim_Player_v2                    AS p ON p.PlayerKey      = f.PlayerKey
JOIN dbo.dim_Team_v2                      AS t ON t.TeamKey        = f.TeamKey
JOIN dbo.dim_Competition_v2               AS c ON c.CompetitionKey = f.CompetitionKey;
GO

-- League-level summary (for dashboards)
CREATE VIEW dbo.v_LeagueSummary AS
SELECT
    c.CompetitionKey,
    c.CompetitionName,

    COUNT(DISTINCT t.TeamKey)   AS TeamsCount,
    COUNT(DISTINCT p.PlayerKey) AS PlayersCount,

    -- volume stats
    SUM(f.MP)            AS TotalMatchesPlayed,
    SUM(f.Gls)           AS TotalGoals,
    SUM(f.Ast)           AS TotalAssists,
    SUM(f.Shots)         AS TotalShots,
    SUM(f.ShotsOnTarget) AS TotalShotsOnTarget,
    SUM(f.xG)            AS Total_xG,
    SUM(f.xAG)           AS Total_xAG,

    -- defending
    SUM(f.Tackles)       AS TotalTackles,
    SUM(f.TacklesPlusInt)AS TotalTklPlusInt,
    SUM(f.Blocks)        AS TotalBlocks,
    SUM(f.Clearances)    AS TotalClearances,

    -- per 90 league-level metrics
    CASE WHEN SUM(f.NinetyMins) > 0
         THEN CAST(SUM(f.Gls) AS FLOAT) / NULLIF(SUM(f.NinetyMins),0) * 90
         ELSE NULL END AS GoalsPer90_League,

    CASE WHEN SUM(f.NinetyMins) > 0
         THEN CAST(SUM(f.xG) AS FLOAT) / NULLIF(SUM(f.NinetyMins),0) * 90
         ELSE NULL END AS xGPer90_League,

    CASE WHEN SUM(f.NinetyMins) > 0
         THEN CAST(SUM(f.SCA) AS FLOAT) / NULLIF(SUM(f.NinetyMins),0) * 90
         ELSE NULL END AS SCAPer90_League,

    CASE WHEN SUM(f.NinetyMins) > 0
         THEN CAST(SUM(f.TacklesPlusInt) AS FLOAT) / NULLIF(SUM(f.NinetyMins),0) * 90
         ELSE NULL END AS TklPlusIntPer90_League
FROM dbo.fact_PlayerSeasonStats_Full      AS f
JOIN dbo.dim_Player_v2                    AS p ON p.PlayerKey      = f.PlayerKey
JOIN dbo.dim_Team_v2                      AS t ON t.TeamKey        = f.TeamKey
JOIN dbo.dim_Competition_v2               AS c ON c.CompetitionKey = f.CompetitionKey
GROUP BY
    c.CompetitionKey,
    c.CompetitionName;
GO

-- Player summary view (core for player page)
CREATE VIEW dbo.v_PlayerSummary AS
SELECT
    p.PlayerKey,
    p.PlayerName,
    p.Nation,
    p.PositionCode,
    p.BornYear,
    p.AgeAtSeason,

    t.TeamKey,
    t.TeamName,
    c.CompetitionKey,
    c.CompetitionName,
    s.SeasonKey,
    s.SeasonName,

    -- base
    f.MP,
    f.Starts,
    f.Minutes,
    f.NinetyMins,

    -- attacking
    f.Gls,
    f.Ast,
    f.GplusA,
    f.GminusPK,
    f.PKGoals,
    f.PKatt,

    -- shots / xG
    f.Shots,
    f.ShotsOnTarget,
    f.xG,
    f.npxG,
    f.xAG,
    f.npxGplusxAG,

    -- creativity
    f.SCA,
    f.SCA90,
    f.GCA,
    f.GCA90,

    -- defending
    f.Tackles,
    f.TacklesWon,
    f.TacklesPlusInt,
    f.Interceptions,
    f.Blocks,
    f.Clearances,

    -- progression / possession
    f.Touches,
    f.Carries,
    f.ProgCarries,
    f.ProgPasses,
    f.ProgRecep,

    -- goalkeeper metrics
    f.GA,
    f.GA90,
    f.SoTA,
    f.Saves,
    f.SavePct,
    f.CS,
    f.CSpercent,
    f.PKsv,
    f.PKm,
    f.PSxG,
    f.PSxG_SoT,
    f.PSxG_PlusMinus,

    -- per 90 derived metrics
    CASE WHEN f.NinetyMins > 0
         THEN CAST(f.Gls  AS FLOAT) / f.NinetyMins * 90 END AS GlsPer90,
    CASE WHEN f.NinetyMins > 0
         THEN CAST(f.Ast  AS FLOAT) / f.NinetyMins * 90 END AS AstPer90,
    CASE WHEN f.NinetyMins > 0
         THEN CAST(f.GplusA AS FLOAT) / f.NinetyMins * 90 END AS GplusAPer90,
    CASE WHEN f.NinetyMins > 0
         THEN CAST(f.Shots AS FLOAT) / f.NinetyMins * 90 END AS ShotsPer90,
    CASE WHEN f.NinetyMins > 0
         THEN CAST(f.SCA   AS FLOAT) / f.NinetyMins * 90 END AS SCAPer90,
    CASE WHEN f.NinetyMins > 0
         THEN CAST(f.TacklesPlusInt AS FLOAT) / f.NinetyMins * 90 END AS TklPlusIntPer90
FROM dbo.fact_PlayerSeasonStats_Full      AS f
JOIN dbo.dim_Player_v2                    AS p ON p.PlayerKey      = f.PlayerKey
JOIN dbo.dim_Team_v2                      AS t ON t.TeamKey        = f.TeamKey
JOIN dbo.dim_Competition_v2               AS c ON c.CompetitionKey = f.CompetitionKey
JOIN dbo.dim_Season_v2                    AS s ON s.SeasonKey      = f.SeasonKey;
GO

-- Goalkeeper-focused summary (for GK dashboard)
CREATE VIEW dbo.v_GoalkeeperSummary AS
SELECT
    p.PlayerKey,
    p.PlayerName,
    p.Nation,
    p.BornYear,
    p.AgeAtSeason,

    t.TeamKey,
    t.TeamName,
    c.CompetitionKey,
    c.CompetitionName,
    s.SeasonKey,
    s.SeasonName,

    -- base
    f.MP,
    f.Starts,
    f.Minutes,
    f.NinetyMins,

    -- GK core stats
    f.GA,
    f.GA90,
    f.SoTA,
    f.Saves,
    f.SavePct,
    f.CS,
    f.CSpercent,
    f.PKsv,
    f.PKm,
    f.PSxG,
    f.PSxG_SoT,
    f.PSxG_PlusMinus,

    -- calculated Save% (safe form)
    CASE WHEN f.SoTA > 0
         THEN CAST(f.Saves AS FLOAT) / NULLIF(f.SoTA,0) * 100
         ELSE NULL END AS Calc_SavePct,

    -- GA per 90
    CASE W
