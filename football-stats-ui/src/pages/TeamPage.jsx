// src/pages/LeaguesPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getLeagues,
  getTeamsByLeague,
  getPlayersByTeam,
} from "../api";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getLeagues();
        setLeagues(data);
      } catch (e) {
        console.error(e);
        setError("Nem sikerült betölteni a ligákat.");
      } finally {
        setLoading(false);
      }
    };
    loadLeagues();
  }, []);

  const handleSelectLeague = async (league) => {
    setSelectedLeague(league);
    setSelectedTeam(null);
    setPlayers([]);
    try {
      setLoading(true);
      setError("");
      const teamsData = await getTeamsByLeague(league.CompetitionKey);
      setTeams(teamsData);
    } catch (e) {
      console.error(e);
      setError("Nem sikerült betölteni a csapatokat.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (team) => {
    setSelectedTeam(team);
    try {
      setLoading(true);
      setError("");
      const playersData = await getPlayersByTeam(team.TeamKey);
      setPlayers(playersData);
    } catch (e) {
      console.error(e);
      setError("Nem sikerült betölteni a játékosokat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ligák / Csapatok / Játékosok
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: "text.secondary" }}>
        Válassz ligát, majd csapatot, és nézd meg a keret részletes statisztikáit.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Ligák */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "70vh" }}>
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom>
                Ligák
              </Typography>
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <List dense>
                  {leagues.map((league) => (
                    <ListItemButton
                      key={league.CompetitionKey}
                      selected={
                        selectedLeague?.CompetitionKey === league.CompetitionKey
                      }
                      onClick={() => handleSelectLeague(league)}
                    >
                      <ListItemText
                        primary={league.CompetitionName}
                        secondary={`Csapatok: ${
                          league.TeamsCount ?? "–"
                        } • Játékosok: ${league.PlayersCount ?? "–"}`}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Csapatok */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "70vh" }}>
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom>
                Csapatok
              </Typography>
              {!selectedLeague && (
                <Typography variant="body2" color="text.secondary">
                  Válassz ki egy ligát bal oldalon.
                </Typography>
              )}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <List dense>
                  {teams.map((team) => (
                    <ListItemButton
                      key={team.TeamKey}
                      selected={selectedTeam?.TeamKey === team.TeamKey}
                      onClick={() => handleSelectTeam(team)}
                    >
                      <ListItemText primary={team.TeamName} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Játékosok */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "70vh" }}>
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom>
                Játékosok
              </Typography>
              {!selectedTeam && (
                <Typography variant="body2" color="text.secondary">
                  Válassz ki egy csapatot a középső listából.
                </Typography>
              )}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                <TableContainer>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Játékos</TableCell>
                        <TableCell>Pos</TableCell>
                        <TableCell align="right">MP</TableCell>
                        <TableCell align="right">Gls</TableCell>
                        <TableCell align="right">Ast</TableCell>
                        <TableCell align="right">xG</TableCell>
                        <TableCell align="right">xAG</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {players.map((p) => (
                        <TableRow
                          key={p.PlayerKey}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => navigate(`/players/${p.PlayerKey}`)}
                        >
                          <TableCell>{p.PlayerName}</TableCell>
                          <TableCell>{p.PositionCode ?? p.Pos}</TableCell>
                          <TableCell align="right">{p.MP}</TableCell>
                          <TableCell align="right">{p.Gls}</TableCell>
                          <TableCell align="right">{p.Ast}</TableCell>
                          <TableCell align="right">
                            {p.xG?.toFixed?.(1)}
                          </TableCell>
                          <TableCell align="right">
                            {p.xAG?.toFixed?.(1)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
