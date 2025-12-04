import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from "@mui/material";

const API_BASE_URL = "/api";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [leaguesError, setLeaguesError] = useState("");

  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState("");

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState("");

  // --- HELPEREK: PascalCase + camelCase támogatása ---

  const getLeagueId = (league) =>
    league?.competitionKey ??
    league?.CompetitionKey ??
    league?.id ??
    league?.Id;

  const getLeagueName = (league) =>
    league?.competitionName ??
    league?.CompetitionName ??
    league?.name ??
    league?.Name;

  const getTeamId = (team) =>
    team?.teamKey ?? team?.TeamKey ?? team?.id ?? team?.Id;

  const getTeamName = (team) =>
    team?.teamName ?? team?.TeamName ?? team?.name ?? team?.Name;

  // --- LIGÁK BETÖLTÉSE ---

  const loadLeagues = async () => {
    setLeaguesLoading(true);
    setLeaguesError("");

    try {
      const res = await fetch(`${API_BASE_URL}/leagues`);
      if (!res.ok) {
        throw new Error(`Hiba a ligák lekérdezésekor: ${res.status}`);
      }
      const data = await res.json();
      setLeagues(data || []);
    } catch (err) {
      console.error(err);
      setLeaguesError("Nem sikerült betölteni a ligákat.");
    } finally {
      setLeaguesLoading(false);
    }
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  // --- CSAPATOK BETÖLTÉSE ---

  const handleLeagueClick = async (league) => {
    setSelectedLeague(league);
    setSelectedTeam(null);
    setPlayers([]);
    setTeams([]);
    setTeamsError("");
    setPlayersError("");

    const leagueId = getLeagueId(league);
    if (!leagueId) return;

    setTeamsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/leagues/${leagueId}/teams`);
      if (!res.ok) {
        throw new Error(`Hiba a csapatok lekérdezésekor: ${res.status}`);
      }
      const data = await res.json();
      setTeams(data || []);
    } catch (err) {
      console.error(err);
      setTeamsError("Nem sikerült betölteni a csapatokat.");
    } finally {
      setTeamsLoading(false);
    }
  };

  // --- JÁTÉKOSOK BETÖLTÉSE ---

  const handleTeamClick = async (team) => {
    setSelectedTeam(team);
    setPlayers([]);
    setPlayersError("");

    const teamId = getTeamId(team);
    if (!teamId) return;

    setPlayersLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/players`);
      if (!res.ok) {
        throw new Error(`Hiba a játékosok lekérdezésekor: ${res.status}`);
      }
      const data = await res.json();
      setPlayers(data || []);
    } catch (err) {
      console.error(err);
      setPlayersError("Nem sikerült betölteni a játékosokat.");
    } finally {
      setPlayersLoading(false);
    }
  };

  return (
    <Box sx={{ color: "white" }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Ligák / Csapatok / Játékosok
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: "#94a3b8" }}>
        Válassz ligát, majd csapatot, és nézd meg a keret részletes statisztikáit.
      </Typography>

      {leaguesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {leaguesError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Ligák oszlop */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              backgroundColor: "#111827",
              color: "white",
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader title="Ligák" />
            <CardContent sx={{ flexGrow: 1 }}>
              {leaguesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <List dense>
                  {leagues.map((league) => {
                    const leagueId = getLeagueId(league);
                    const leagueName = getLeagueName(league);
                    const teamsCount =
                      league.teamsCount ?? league.TeamsCount ?? null;
                    const playersCount =
                      league.playersCount ?? league.PlayersCount ?? null;

                    return (
                      <ListItemButton
                        key={leagueId}
                        selected={
                          selectedLeague &&
                          getLeagueId(selectedLeague) === leagueId
                        }
                        onClick={() => handleLeagueClick(league)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                        }}
                      >
                        <ListItemText
                          primary={leagueName}
                          secondary={
                            teamsCount && playersCount
                              ? `${teamsCount} csapat · ${playersCount} játékos`
                              : undefined
                          }
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Csapatok oszlop */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: "#111827",
              color: "white",
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title="Csapatok"
              subheader={
                selectedLeague ? getLeagueName(selectedLeague) : "Válassz ligát bal oldalon."
              }
              subheaderTypographyProps={{ sx: { color: "#9ca3af" } }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {teamsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {teamsError}
                </Alert>
              )}

              {teamsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <List dense>
                  {teams.map((team) => {
                    const teamId = getTeamId(team);
                    const teamName = getTeamName(team);
                    return (
                      <ListItemButton
                        key={teamId}
                        selected={
                          selectedTeam && getTeamId(selectedTeam) === teamId
                        }
                        onClick={() => handleTeamClick(team)}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                      >
                        <ListItemText primary={teamName} />
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Játékosok oszlop */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              backgroundColor: "#111827",
              color: "white",
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title="Játékosok"
              subheader={
                selectedTeam
                  ? getTeamName(selectedTeam)
                  : "Válassz ki egy csapatot a középső listából."
              }
              subheaderTypographyProps={{ sx: { color: "#9ca3af" } }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {playersError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {playersError}
                </Alert>
              )}

              {playersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "#9ca3af" }}>Játékos</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>Pos</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>MP</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>Min</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>Gls</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>Ast</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>xG</TableCell>
                        <TableCell sx={{ color: "#9ca3af" }}>xAG</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {players.map((p) => (
                        <TableRow key={p.playerKey ?? p.PlayerKey ?? p.id}>
                          <TableCell>{p.player ?? p.Player ?? p.name}</TableCell>
                          <TableCell>{p.pos ?? p.Pos}</TableCell>
                          <TableCell>{p.mp ?? p.MP}</TableCell>
                          <TableCell>{p.min ?? p.Min}</TableCell>
                          <TableCell>{p.gls ?? p.Gls}</TableCell>
                          <TableCell>{p.ast ?? p.Ast}</TableCell>
                          <TableCell>{p.xg ?? p.xG ?? p.XG}</TableCell>
                          <TableCell>{p.xag ?? p.xAG ?? p.XAG}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
