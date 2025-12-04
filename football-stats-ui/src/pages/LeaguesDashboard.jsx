import { useEffect, useState } from "react";
import {
  getLeagues,
  getTeamsByLeague,
  getPlayersByTeam,
  getPlayer,
  getGoalkeepers,
} from "../api";
import "../App.css";

function LeaguesDashboard() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);

  const [goalkeepers, setGoalkeepers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ligák betöltése induláskor
  useEffect(() => {
    setLoading(true);
    getLeagues()
      .then((data) => {
        setLeagues(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Nem sikerült betölteni a ligákat.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Liga kiválasztása
  const handleSelectLeague = async (league) => {
    setSelectedLeague(league);
    setSelectedTeam(null);
    setPlayers([]);
    setSelectedPlayer(null);
    setSelectedPlayerDetails(null);
    setGoalkeepers([]);
    setError("");
    setLoading(true);

    try {
      const competitionId = league.CompetitionKey;

      const [teamsData, gkData] = await Promise.all([
        getTeamsByLeague(competitionId),
        getGoalkeepers(competitionId),
      ]);

      setTeams(teamsData);
      setGoalkeepers(gkData);
    } catch (err) {
      console.error(err);
      setError("Nem sikerült betölteni a csapatokat / kapusokat.");
    } finally {
      setLoading(false);
    }
  };

  // Csapat kiválasztása
  const handleSelectTeam = async (team) => {
    setSelectedTeam(team);
    setSelectedPlayer(null);
    setSelectedPlayerDetails(null);
    setError("");
    setLoading(true);

    try {
      const teamId = team.TeamKey;
      const playersData = await getPlayersByTeam(teamId);
      setPlayers(playersData);
    } catch (err) {
      console.error(err);
      setError("Nem sikerült betölteni a játékosokat.");
    } finally {
      setLoading(false);
    }
  };

  // Játékos kiválasztása
  const handleSelectPlayer = async (player) => {
    setSelectedPlayer(player);
    setSelectedPlayerDetails(null);
    setError("");
    setLoading(true);

    try {
      const playerId = player.PlayerKey;
      const details = await getPlayer(playerId);
      setSelectedPlayerDetails(details);
    } catch (err) {
      console.error(err);
      setError("Nem sikerült betölteni a játékos adatlapját.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leagues-dashboard">
      {loading && <div className="info-banner">Betöltés...</div>}
      {error && <div className="error-banner">{error}</div>}

      <main className="grid">
        {/* Ligák oszlop */}
        <section className="panel">
          <h2>Ligák</h2>
          <ul className="list">
            {leagues.map((league) => (
              <li
                key={league.CompetitionKey}
                className={
                  selectedLeague?.CompetitionKey === league.CompetitionKey
                    ? "list-item selected"
                    : "list-item"
                }
                onClick={() => handleSelectLeague(league)}
              >
                <strong>{league.CompetitionName}</strong>
                <div className="sub">
                  Csapatok: {league.TeamsCount} • Játékosok: {league.PlayersCount}
                </div>
                <div className="sub">
                  Gól/90: {league.GoalsPer90_League?.toFixed?.(2)} • Tkl+Int/90:{" "}
                  {league.TklPlusIntPer90_League?.toFixed?.(2)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Csapatok oszlop */}
        <section className="panel">
          <h2>Csapatok</h2>
          {selectedLeague ? (
            <ul className="list">
              {teams.map((team) => (
                <li
                  key={team.TeamKey}
                  className={
                    selectedTeam?.TeamKey === team.TeamKey
                      ? "list-item selected"
                      : "list-item"
                  }
                  onClick={() => handleSelectTeam(team)}
                >
                  {team.TeamName}
                </li>
              ))}
            </ul>
          ) : (
            <p>Válassz ki egy ligát bal oldalon.</p>
          )}
        </section>

        {/* Játékosok oszlop */}
        <section className="panel">
          <h2>Játékosok</h2>
          {selectedTeam ? (
            <ul className="list">
              {players.map((player) => (
                <li
                  key={player.PlayerKey}
                  className={
                    selectedPlayer?.PlayerKey === player.PlayerKey
                      ? "list-item selected"
                      : "list-item"
                  }
                  onClick={() => handleSelectPlayer(player)}
                >
                  <strong>{player.PlayerName}</strong> ({player.PositionCode})
                  <div className="sub">
                    MP: {player.MP} • Gls: {player.Gls} • Ast: {player.Ast}
                  </div>
                  <div className="sub">
                    xG: {player.xG?.toFixed?.(2)} • xAG:{" "}
                    {player.xAG?.toFixed?.(2)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Válassz ki egy csapatot középen.</p>
          )}
        </section>

        {/* Játékos adatlap / Kapus toplista */}
        <section className="panel">
          <h2>Játékos adatlap / Kapus toplista</h2>

          {selectedPlayerDetails ? (
            <div className="player-card">
              <h3>
                {selectedPlayerDetails.PlayerName} (
                {selectedPlayerDetails.PositionCode})
              </h3>
              <p>
                Csapat: {selectedPlayerDetails.TeamName} <br />
                Liga: {selectedPlayerDetails.CompetitionName}
              </p>
              <div className="stats-grid">
                <div>
                  <h4>Játékidő</h4>
                  <p>MP: {selectedPlayerDetails.MP}</p>
                  <p>Starts: {selectedPlayerDetails.Starts}</p>
                  <p>Minutes: {selectedPlayerDetails.Minutes}</p>
                </div>
                <div>
                  <h4>Támadás</h4>
                  <p>Gól: {selectedPlayerDetails.Gls}</p>
                  <p>
                    Gól + Assziszt:{" "}
                    {selectedPlayerDetails.GplusA ??
                      selectedPlayerDetails.GPlusA}
                  </p>
                  <p>xG: {selectedPlayerDetails.xG}</p>
                </div>
                <div>
                  <h4>Kreativitás</h4>
                  <p>
                    SCA90:{" "}
                    {selectedPlayerDetails.SCAper90?.toFixed?.(2) ??
                      selectedPlayerDetails.SCAPer90?.toFixed?.(2)}
                  </p>
                  <p>GCA90: {selectedPlayerDetails.GCA90}</p>
                </div>
                <div>
                  <h4>Védekezés</h4>
                  <p>
                    Tkl+Int:{" "}
                    {selectedPlayerDetails.TacklesPlusInt ??
                      selectedPlayerDetails.TklPlusInt}
                  </p>
                  <p>
                    Tkl+Int/90:{" "}
                    {selectedPlayerDetails.TklPlusIntPer90?.toFixed?.(2)}
                  </p>
                </div>
              </div>
            </div>
          ) : selectedLeague ? (
            <>
              <h3>Kapusok – {selectedLeague.CompetitionName}</h3>
              {goalkeepers.length === 0 ? (
                <p>Nincs adat a kapusokra.</p>
              ) : (
                <table className="gk-table">
                  <thead>
                    <tr>
                      <th>Játékos</th>
                      <th>Csapat</th>
                      <th>MP</th>
                      <th>GA90</th>
                      <th>Save%</th>
                      <th>PSxG±/90</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalkeepers.slice(0, 10).map((gk) => (
                      <tr key={gk.PlayerKey}>
                        <td>{gk.PlayerName}</td>
                        <td>{gk.TeamName}</td>
                        <td>{gk.MP}</td>
                        <td>{gk.GA90?.toFixed?.(2)}</td>
                        <td>{gk.SavePct?.toFixed?.(1)}</td>
                        <td>{gk.PSxG_PlusMinus_per90?.toFixed?.(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="hint">
                Tipp: válassz ki egy játékost a játékoslistából, hogy az
                adatlapja jelenjen meg itt.
              </p>
            </>
          ) : (
            <p>
              Válassz ligát a bal oldalon, hogy lásd a kapus top listát vagy egy
              játékos adatlapját.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default LeaguesDashboard;
