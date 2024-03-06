const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

let db = null
const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initDbAndServer()

//Get list of players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `select 
    player_id as playerId,
    player_name as playerName
    from player_details;`
  const playersList = await db.all(getPlayersQuery)
  response.send(playersList)
})
//Get player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `select
    player_id as playerId,
    player_name as playerName 
    from player_details where player_id = ${playerId}`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})
//Update player details
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `update player_details set
  player_name = '${playerName}' where player_id = ${playerId};`
  const updatedPlayer = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//Get match
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuery = `select
  match_id as matchId, match, year
  from match_details where match_id = ${matchId};`
  const match = await db.get(getMatchQuery)
  response.send(match)
})
//Get matches
app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getMatchesQuery = `select 
  match_id as matchId, match, year from 
  match_details natural join player_match_score
  where player_id = ${playerId};`
  const matches = await db.all(getMatchesQuery)
  response.send(matches)
})
//Get players of spec match
app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const getMatchPlayersQuery = `select
  player_id as playerId, player_name as playerName
  from player_details natural join player_match_score
  where match_id = ${matchId};`
  const matchPlayers = await db.all(getMatchPlayersQuery)
  response.send(matchPlayers)
})
//Get stats of spec player
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const getStatsQuery = `select 
  player_id as playerId, player_name as playerName,
  sum(score) as totalScore, 
  sum(fours) as totalFours,
  sum(sixes) as totalSixes from player_match_score
  natural join player_details
  where player_id = ${playerId};`
  const stats = await db.get(getStatsQuery)
  response.send(stats)
})
module.exports = app
