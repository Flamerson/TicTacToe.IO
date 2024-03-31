var game = document.getElementById("game-area"); 
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const textWin = document.getElementById("textWin");
const winGame = document.getElementById("win-game");
const playerName = document.getElementById("player");

const socket = io();

let checkPlayerTurn = 0;

let gameEnd = 0;

// aqui criamos o tabuleiro
for(let i = 0; i != 9; i++){
    oldGame = game.innerHTML;
    game.innerHTML = oldGame + `<div class="square" id="square-${i}" onclick="checkClickSquare(${i})" ></div>`;
};

var params = location.search.substring(1).split('&');

//Criar objeto que vai conter os parametros
var paramArray = {};

//Passar por todos os parametros
for(var i=0; i<params.length; i++) {
    //Dividir os parametros chave e valor
    var param = params[i].split('=');

    //Adicionar ao objeto criado antes
    paramArray[param[0]] = param[1];
}

socket.emit("new-player", paramArray.number)

if(paramArray.player == 1){
    player1.innerHTML = paramArray.name
}

socket.on("game-start", obj => {
    if(gameEnd == 0){
        if(paramArray.player == 1){
            playerName.innerHTML = "Vez do player 1"
            socket.emit("check-player", paramArray.number)
        }
        winGame.className = "disable";
        player2.innerHTML = obj.player2;
        checkPlayerTurn = obj.player;
    }
})

socket.on("player-connected", obj => {
    player1.innerHTML = obj.player1;
    player2.innerHTML = obj.player2;
})

socket.on("game-end", obj => {
    winGame.className = "win-game";

    for(let i = 0; i < obj.gameTable.length; i ++){
        if(obj.gameTable[i] == 1){
            const gamesquare = document.getElementById(`square-${i}`);
            gamesquare.innerHTML = "x";
        }
        if(obj.gameTable[i] == 2){
            const gamesquare = document.getElementById(`square-${i}`);
            gamesquare.innerHTML = "o";
        }
    }

    playerName.innerHTML = "Tic Tac Toe";

    if(obj.victory == 1){
        textWin.innerHTML = "player 1 win"
    }
    if(obj.victory == 2){
        textWin.innerHTML = "player 2 win"
    }
    if(obj.victory == 3){
        textWin.innerHTML = "game draw"
    }
    socket.emit("game-off", paramArray.number)
})

socket.on("game-throw", obj => {
    winGame.className = "win-game";

    playerName.innerHTML = "Tic Tac Toe";

    if(obj.victory == 1){
        textWin.innerHTML = "player 1 win"
    }
    if(obj.victory == 2){
        textWin.innerHTML = "player 2 win"
    }
    if(obj.victory == 3){
        textWin.innerHTML = "game draw"
    }
    gameEnd = 1;
})

socket.on("next-player", obj => {
    for(let i = 0; i < obj.gameTable.length; i ++){
        if(obj.gameTable[i] == 1){
            const gamesquare = document.getElementById(`square-${i}`);
            gamesquare.innerHTML = "x";
        }
        if(obj.gameTable[i] == 2){
            const gamesquare = document.getElementById(`square-${i}`);
            gamesquare.innerHTML = "o";
        }
    }

    if(paramArray.player == obj.player){
        playerName.innerHTML = "Sua vez de jogar ";
    }
    checkPlayerTurn = obj.player;
})

socket.on("game-rematch", obj => {

    winGame.className = "disable";
    gameEnd = 0;

    for(let i = 0; i != 9; i ++){
        let square = document.getElementById(`square-${i}`);
        square.innerHTML = "";
    }

    playerName.innerHTML = "Vez do player 1"
    checkPlayerTurn = obj.player;
})




// game frontend logic

function checkClickSquare(number){
    let square = document.getElementById(`square-${number}`)

    if(checkPlayerTurn != paramArray.player){
        alert("não é sua vez");
        return;
    }

    if(paramArray.player == 1){
        if(square.innerHTML != ""){
            return;
        }
        square.innerHTML = "x"
        checkPlayerTurn = 0;
        playerName.innerHTML = "Vez do player 2"
        endTurn(number)
    }else{
        if(square.innerHTML != ""){
            return;
        }
        square.innerHTML = "o"
        checkPlayerTurn = 0;
        playerName.innerHTML = "Vez do player 1"
        endTurn(number)
    }

}


function endTurn(number){

    let obj = {
        room: paramArray.number,
        number: number
    }

    socket.emit("check", obj);

}

function restartGame(){

    gameEnd = 0;

    if(paramArray.player == 1){
        checkPlayerTurn = 1;
    }

    let data = {
        room: paramArray.number,
        player: paramArray.player,
        name: paramArray.name
    }

    winGame.className = "disable";

    for(let i = 0; i != 9; i ++){
        let square = document.getElementById(`square-${i}`);
        square.innerHTML = "";
    }

    playerName.innerHTML = "Vez do player 1"
    socket.emit("game-restart", data);

}