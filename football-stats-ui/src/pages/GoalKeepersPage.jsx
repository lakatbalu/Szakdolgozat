import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const API_BASE_URL = "/api";

export default function GoalkeepersPage() {
  const [leagues, setLeagues] = useState([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [leaguesError, setLeaguesError] = useState("");

  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [goalkeepers, setGoalkeepers] = useState([]);
  const [gkLoading, setGkLoading] = useState(false);
  const [gkError, setGkError] = useState("");

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

  // Ligák betöltése
  const loadLeagues = async () => {
    setLeaguesLoading(true);
    setLeaguesError("");

    try {
      const res = await fetch(`${API_BASE_URL}/goalkeepers/leagues`);
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

  // Kapusok betöltése egy ligára
  const loadGoalkeepers = async (leagueId) => {
    if (!leagueId) return;

    setGkLoading(true);
    setGkError("");
    setGoalkeepers([]);

    try {
      const res = await fetch(`${API_BASE_URL}/goalkeepers/${leagueId}`);
      if (!res.ok) {
        throw new Error(`Hiba a kapusok lekérdezésekor: ${res.status}`);
      }
      const data = await res.json();
      setGoalkeepers(data || []);
    } catch (err) {
      console.error(err);
      setGkError("Nem sikerült betölteni a kapus statisztikákat.");
    } finally {
      setGkLoading(false);
    }
  };

  const handleLeagueChange = (event) => {
    const value = event.target.value;
    setSelectedLeagueId(value);
    loadGoalkeepers(value);
  };

  return (
    <Box sx={{ color: "white" }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Kapus Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: "#94a3b8" }}>
        Válassz bajnokságot, és vizsgáld meg a kapusok teljesítményét
        (GA90, Save%, PSxG+/-).
      </Typography>

      {leaguesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {leaguesError}
        </Alert>
      )}

      {/* Liga választó */}
      <Card
        sx={{
          backgroundColor: "#111827",
          color: "white",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel id="league-select-label" sx={{ color: "#cbd5f5" }}>
              Bajnokság
            </InputLabel>
            <Select
              labelId="league-select-label"
              value={selectedLeagueId}
              label="Bajnokság"
              onChange={handleLeagueChange}
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
              }}
            >
              {leagues.map((league) => {
                const id = getLeagueId(league);
                const name = getLeagueName(league);
                return (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Kapus rangsor */}
      <Card
        sx={{
          backgroundColor: "#111827",
          color: "white",
          borderRadius: 3,
        }}
      >
        <CardHeader
          title="Kapus rangsor"
          subheader="Ligán belüli teljesítmény: GA90, Save%, PSxG+/-"
          subheaderTypographyProps={{ sx: { color: "#9ca3af" } }}
        />
        <CardContent>
          {gkError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {gkError}
            </Alert>
          )}

          {gkLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#9ca3af" }}>Játékos</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>Csapat</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>MP</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>Min</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>GA90</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>Save%</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>PSxG</TableCell>
                    <TableCell sx={{ color: "#9ca3af" }}>PSxG+/-</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {goalkeepers.map((gk) => (
                    <TableRow
                      key={gk.playerKey ?? gk.PlayerKey ?? gk.id ?? gk.Id}
                    >
                      <TableCell>{gk.player ?? gk.Player}</TableCell>
                      <TableCell>{gk.squad ?? gk.Squad}</TableCell>
                      <TableCell>{gk.mp ?? gk.MP}</TableCell>
                      <TableCell>{gk.min ?? gk.Min}</TableCell>
                      <TableCell>{gk.ga90 ?? gk.GA90}</TableCell>
                      <TableCell>{gk.savePct ?? gk.SavePct ?? gk.SavePct90}</TableCell>
                      <TableCell>{gk.psxg ?? gk.PSxG}</TableCell>
                      <TableCell>{gk.psxgPlusMinus ?? gk.PSxGPlusMinus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
