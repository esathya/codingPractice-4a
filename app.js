const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running At http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get(`/players/`, async (request, response) => {
  const getListOfAllPlayersQuery = `
    SELECT * FROM cricket_team;`;
  const allPlayersArray = await db.all(getListOfAllPlayersQuery);
  response.send(
    allPlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post(`/players/`, async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postPlayerQuery = `
  INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES(
      '${playerName}',
      '${jerseyNumber}',
      '${role}'
  );`;
  const dbResponse = await db.run(postPlayerQuery);
  const playerId = dbResponse.lastID;
  //response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

app.get(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
  SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
  UPDATE cricket_team SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  WHERE player_id = '${playerId}';`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id = '${playerId}'`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
