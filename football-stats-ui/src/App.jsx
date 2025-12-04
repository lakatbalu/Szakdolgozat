import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

import HomePage from "./pages/HomePage"; // a saját, már működő főoldalad
import LeaguesPage from "./pages/LeaguesPage";
import GoalkeepersPage from "./pages/GoalkeepersPage";

const drawerWidth = 260;

export default function App() {
  return (
    <Router>
      <Box sx={{ display: "flex", backgroundColor: "#020617", minHeight: "100vh" }}>
        <CssBaseline />

        {/* Felső sáv */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "#0f172a",
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Youth Football Stats Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Oldalsó menü */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#020617",
              color: "white",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              <ListItemButton component={Link} to="/">
                <ListItemIcon>
                  <HomeIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Főoldal" />
              </ListItemButton>

              <ListItemButton component={Link} to="/leagues">
                <ListItemIcon>
                  <EqualizerIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Ligák / Csapatok" />
              </ListItemButton>

              <ListItemButton component={Link} to="/goalkeepers">
                <ListItemIcon>
                  <SportsSoccerIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Kapusok" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>

        {/* Tartalom */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#020617",
            color: "white",
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/goalkeepers" element={<GoalkeepersPage />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}
