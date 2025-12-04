// src/api.js
const API_BASE = "http://localhost:5023/api";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API hiba: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getLeagues() {
  return apiGet("/leagues");
}

export function getTeamsByLeague(competitionKey) {
  return apiGet(`/leagues/${competitionKey}/teams`);
}

export function getPlayersByTeam(teamKey) {
  return apiGet(`/teams/${teamKey}/players`);
}

export function getPlayer(playerKey) {
  return apiGet(`/players/${playerKey}`);
}

export function getGoalkeepers(competitionKey) {
  return apiGet(`/leagues/${competitionKey}/goalkeepers`);
}
