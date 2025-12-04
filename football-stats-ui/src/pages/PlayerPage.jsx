// src/pages/PlayerPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getPlayer } from "../api";

export default function PlayerPage() {
  const { playerKey } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPlayer(playerKey);
        setPlayer(data);
      } catch (e) {
        console.error(e);
        setError("Nem sikerült betölteni a játékos adatlapját.");
      } finally {
        setLoading(false);
      }
    };
    if (playerKey) {
      load();
    }
  }, [playerKey]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {player.PlayerName} – Játékosprofil
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: "text.secondary" }}>
        {player.TeamName} • {player.CompetitionName} • {player.PositionCode ?? player.Pos} •{" "}
        {player.Age ? `${player.Age} év` : null}
      </Typography>

      <Grid container spacing={3}>
        {/* Alapadatok */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Alapadatok
              </Typography>
              <Typography variant="body2">
                MP: {player.MP} <br />
                Starts: {player.Starts} <br />
                Min: {player.Min} <br />
                90s: {player["90s"]}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Támadás */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Támadójáték
              </Typography>
              <Typography variant="body2">
                Gls: {player.Gls} <br />
                Ast: {player.Ast} <br />
                G+A: {player["G+A"]} <br />
                G-PK: {player["G-PK"]} <br />
                G+A-PK: {player["G+A-PK"]} <br />
                Sh: {player.Sh} • SoT: {player.SoT} <br />
                SoT%: {player["SoT%"]} <br />
                G/Sh: {player["G/Sh"]} • G/SoT: {player["G/SoT"]}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* xG / kreativitás */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                xG / xAG / kreativitás
              </Typography>
              <Typography variant="body2">
                xG: {player.xG} <br />
                npxG: {player.npxG} <br />
                xAG: {player.xAG} <br />
                xG+xAG: {player["xG+xAG"]} <br />
                xG/Sh: {player["xG/Sh"]} <br />
                npxG/Sh: {player["npxG/Sh"]} <br />
                SCA: {player.SCA} • SCA90: {player.SCA90} <br />
                GCA: {player.GCA} • GCA90: {player.GCA90}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Védekezés + labdabirtoklás + fegyelem */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Védekezés / labdabirtoklás / fegyelem
              </Typography>
              <Typography variant="body2">
                Tkl: {player.Tkl} • TklW: {player.TklW} <br />
                Int: {player.Int} • Tkl+Int: {player["Tkl+Int"]} <br />
                Blocks: {player.Blocks} • Clr: {player.Clr} <br />
                Touches: {player.Touches} <br />
                PrgC: {player.PrgC} • PrgP: {player.PrgP} • PrgR: {player.PrgR} <br />
                CrdY: {player.CrdY} • 2CrdY: {player["2CrdY"]} • CrdR: {player.CrdR}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
