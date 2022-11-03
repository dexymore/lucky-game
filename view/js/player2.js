import config from './config.js';
import { change, displayAnotherPlayerData, showRealScore } from './utils.js';
const player1 = document.querySelector('.player--0 ');
const score1 = document.querySelector('#score--0');
const currentscore1 = document.getElementById('current--0');

const player2 = document.querySelector('.player--1');
const score2 = document.querySelector('#score--1');
const currentscore2 = document.getElementById('current--1');

const dice = document.querySelector('.dice');

const roll = document.querySelector('.btn--roll');
const newbutton = document.querySelector('.btn--new');
const hold = document.querySelector('.btn--hold');

const socket = io('/player2', {
    auth: {
        roomId: 'ay0MWc-oKIZfhHVrAAAR'
    }
});
socket.on('joinedRoom', (room) => {
    console.log('room id', room);
    config.realScore[0] = room.player1Score;
    config.realScore[1] = room.player2Score;
    config.currScore = room.currentScore;
    config.playing = room.player2GameState;
    config.activePlayer = room.activePlayer;
    config.roomId = room.id;
});
socket.on('player1RolledDice', (metaData) => {
    config.currScore = metaData.currentScore;
    displayAnotherPlayerData(
        metaData.diceNumber,
        config.currScore,
        dice,
        config.activePlayer == 0 ? currentscore1 : currentscore2
    );
});
socket.on('player1HoldedScore', (metaData) => {
    config.realScore[0] = metaData.player1Score;
    config.playing = metaData.player2GameState;
    config.activePlayer = metaData.activePlayer;
    config.currScore = metaData.currentScore;
    currentscore1.innerHTML = config.currScore;
    showRealScore(metaData.player1Score, score1);
});
/**
 * {
        currentScore: number;
        activePlayer: number;
        player2GamsState: boolean;
    }
*/
socket.on('player1OutOfLuck', (metaData) => {
    console.log(metaData);
    config.currScore = metaData.currentScore;
    config.activePlayer = metaData.activePlayer;
    config.playing = metaData.player2GameState;
    currentscore1.innerHTML = config.currScore;
});
socket.on('connect_error', (err) => {
    console.log(err);
});

//! overwrited the event handler for roll btn for now maybe change it later, why? i faced problems was socket and how to make it global so worked around idk
roll.addEventListener('click', function () {
    // start rolling
    if (config.playing) {
        const random = Math.trunc(Math.random() * 6) + 1; //creating the random num
        //exposing the dices images to the user
        dice.classList.remove('hidden');
        dice.src = `/pics/dice-${random}.png`;
        socket.emit('rolledDice', random);
        if (random === 1) {
            currentscore1.innerHTML = 0;
            currentscore2.innerHTML = 0;
            socket.emit('imSorryImJinkx');
            config.playing = false;
            // change(player1, player2, currentscore1, currentscore2); //change the currnt statue of the player because an 1 has occuored
        } else if (config.activePlayer === 0) {
            config.currScore += random;
            currentscore1.innerHTML = config.currScore;
        } else if (config.activePlayer === 1) {
            config.currScore += random;
            currentscore2.innerHTML = config.currScore;
        }
    }
});
hold.addEventListener('click', function () {
    if (config.playing) {
        if (config.activePlayer === 0) {
            config.realScore[0] += Number(config.currScore);
            score1.innerHTML = config.realScore[0];
        } else if (config.activePlayer === 1) {
            config.realScore[1] += Number(config.currScore);
            score2.innerHTML = config.realScore[1];
        }
        config.playing = false;
        socket.emit('holdedScore');
        //* who got 100 first wins logic
        if (config.realScore[config.activePlayer] >= 100) {
            config.playing = false;
            document
                .querySelector(`.player--${config.activePlayer}`)
                .classList.remove('player--active');
            document
                .querySelector(`.player--${config.activePlayer}`)
                .classList.add('player--winner');
        }
        // change(); //change the current statue of the player becuase on of the players pressed hold
    }
});
