
/**
 * The code runs with node: https://nodejs.org/en/download/
 * Requirements:
 * $ npm install express
 * $ npm install serialport
 *
 * Assumptions:
 * Arduino is connected at COM3 (Can improve l8r)
 * The data from the arduino comes as Json and matches gameState in form
 *
 * To Start:
 * $ node quidditchScoreboard.js
 *
 * @author nzoner 11/10/21
 * */

 // Imports
const fs = require('fs').promises;
const express = require('express');
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

// Setup the SerialPort Communication
const serialPort = new SerialPort('COM3');
const parser = new Readline();

// Setup an express app to use as localhost
const localHost = express();
localHost.listen(3000);

/**
* This is basically a contract with the arduino that the data will be
* structured like this.
* */
gameState = {
    time: "00:00",
    teamAScore: 0,
    teamBScore: 0
}

// Callback on new serial line
function updateGameState(data) {
    try{gameState = JSON.parse(data)}
    catch{}
}

// Configure localhost:3000/ to be scoreboard.html
localHost.get('/', function (req, res) {
    res.set('Content-Type', 'text/html')
    fs.readFile("scoreboard.html").then(webpageLayout => {
        res.send(webpageLayout);
    })
})

// Configure localhost:3000/config to be config.html
localHost.get('/config', function (req, res) {
    res.set('Content-Type', 'text/html')
    fs.readFile("config.html").then(webpageLayout => {
        res.send(webpageLayout);
    })
})

// Set localhost:3000/score reads to return gameState
localHost.get('/score', function (req, res) {
    res.set('Content-Type', 'application/json')
    res.send(gameState);
})

// Set localhost:3000/team_data reads to return ./tqcTeams.json
localHost.get('/team_data', function (req, res) {
    res.set('Content-Type', 'application/json')
    fs.readFile("tqcTeams.json").then(teamData => {
        res.send(teamData);
    })
})

// Configure serialPort updates to trigger updateGameState
serialPort.pipe(parser);
parser.on('data', updateGameState);
