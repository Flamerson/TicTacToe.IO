const express = require('express');
const app = express();
const http = require("http");
const { join } = require('path');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }))

var rooms = [];

const gameTable = [0,0,0,0,0,0,0,0,0];

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public/index.html"))
})
 
app.get("/room/", (req,res) => {
  res.sendFile(join(__dirname , "public/room.html"))
})

app.post("/room", (req, res) => {
  const roomNumber = rooms.length + 1;
  rooms.push({
    room: roomNumber, 
    player: 0, 
    player1: req.body.name, 
    player2: "", 
    gameTable: gameTable,
    victory: 0
  })
  res.redirect(`/room/?name=${req.body.name}&number=${roomNumber}&player=${1}`)
})

app.post("/enter", (req, res, next) => {
  const codeNumber = Number(req.body.code)

  for(let i = 0;i < rooms.length; i++){
    if(codeNumber == rooms[i].room){
      if(rooms[i].player2 != ""){
        redirectHead("/")
      }
      rooms[i].player2 = req.body.name;
      redirectHead(`/room/?name=${req.body.name}&number=${codeNumber}&player=${2}`)
    }
  }

  redirectHead("/")

  function redirectHead(head) {
    res.redirect(head)
    next()
  }

})

io.on('connection', (socket) => {
    socket.on("new-player", room => {
      socket.join(room)
      if(rooms[Number(room) - 1].player2 != ""){
        console.log("entrou aqui")
        rooms[Number(room) - 1].player = 1;
        socket.to(room).emit("game-start", rooms[Number(room) - 1])
      }
    })

    socket.on("check-player", room => {
      socket.to(room).emit("player-connected", rooms[Number(room) - 1])
    })

    socket.on("check", obj => {
      const room = Number(obj.room) - 1;
      checkWinner(rooms[room].player , obj.number , room);
      if(rooms[room].victory != 0){
        socket.to(obj.room).emit("game-end", rooms[room]);
      }else{
        if(rooms[room].player == 1){
          rooms[room].player = 2
        }else{
          rooms[room].player = 1
        }
        socket.to(obj.room).emit("next-player", rooms[room])
      }
    })

    socket.on("game-off", room => {
      socket.to(room).emit("game-throw", rooms[room - 1]);
    }) 

    socket.on("game-restart", obj => {
      let room = obj.room -1;

      rooms[room].victory = 0;
      rooms[room].gameTable = [0,0,0,0,0,0,0,0,0];
      rooms[room].player = 1;
      
      socket.to(obj.room).emit("game-rematch", rooms[room]);

    })
});

server.listen(PORT);



// game backend logic

function checkWinner(player, number, room){
  rooms[room].gameTable[number] = player;
  const gameSquares = rooms[room].gameTable;


  for(let i = 0;checkWinnerTabble.length > i; i ++){

    let line1 = checkWinnerTabble[i][0];
    let line2 = checkWinnerTabble[i][1];
    let line3 = checkWinnerTabble[i][2];

    // verifica se um dos players ganhou
    if(gameSquares[line1] == player && gameSquares[line2] == player && gameSquares[line3] == player){
        rooms[room].victory = player;
    }   

    // verifica se deu empate, essa função every é massa, ela é booleana.
    if(gameSquares.every(e => (e != 0))){
      rooms[room].victory = 3;
    }
  }

}

const checkWinnerTabble = [
  // horizontal win
  [0,1,2],
  [3,4,5],
  [6,7,8],
  // vertical win
  [0,3,6],
  [1,4,7],
  [2,5,8],
  // diagonal win
  [0,4,8],
  [2,4,6]
]