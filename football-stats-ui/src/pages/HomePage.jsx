import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

// Itt állítsd be, ami a többi oldalon is van:
const API_BASE_URL = "/api";

function StatCard({ title, value, subtitle }) {
  return (
    <Card
      sx={{
        backgroundColor: "#111827",
        color: "white",
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) lekérjük az összes ligát
        const res = await fetch(`${API_BASE_URL}/leagues`);
        if (!res.ok) {
          throw new Error(`Hibás válasz: ${res.status}`);
        }
        const leagues = await res.json();

        if (!Array.isArray(leagues) || leagues.length === 0) {
          throw new Error("Nem érkezett liga adat.");
        }

        // 2) aggregálás frontenden (mert a backend még nem ad külön summary-t)
        const totalLeagues = leagues.length;
        const totalTeams = leagues.reduce(
          (sum, l) => sum + (l.teamsCount ?? 0),
          0
        );
        const totalPlayers = leagues.reduce(
          (sum, l) => sum + (l.playersCount ?? 0),
          0
        );
        const totalGoals = leagues.reduce(
          (sum, l) => sum + (l.totalGoals ?? 0),
          0
        );
        const totalMatches = leagues.reduce(
          (sum, l) => sum + (l.totalMatchesPlayed ?? 0),
          0
        );

        const goalsPerMatch =
          totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "–";

        setSummary({
          totalLeagues,
          totalTeams,
          totalPlayers,
          totalGoals,
          totalMatches,
          goalsPerMatch,
        });
      } catch (err) {
        console.error(err);
        setError("Nem sikerült betölteni az összefoglaló statisztikákat.");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: "white" }}>
        Főoldal – Összefoglaló
      </Typography>
      <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)" }}>
        Gyors áttekintés a ligákról, csapatokról, játékosokról és a futball
        intenzitásáról.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            backgroundColor: "#7f1d1d",
            color: "white",
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && summary && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={2.4}>
            <StatCard
              title="Ligák száma"
              value={summary.totalLeagues}
              subtitle="Összes bajnokság"
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatCard
              title="Csapatok száma"
              value={summary.totalTeams}
              subtitle="Minden ligában"
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatCard
              title="Játékosok száma"
              value={summary.totalPlayers}
              subtitle="Összes regisztrált játékos"
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatCard
              title="Összes gól"
              value={summary.totalGoals}
              subtitle="Minden bajnokságban"
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatCard
              title="Gól / meccs"
              value={summary.goalsPerMatch}
              subtitle="Átlagos góltermés"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
