const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
var fs = require("fs");
var ships = [[], []];
var state = 'DEPLOY';
var randomList = [];
var opposite;
var programcount = 0;
var me_1=0;
var me_2=0;
var firstclient = [];
var hitplaces = [[],[]];
var score_count = 0;
var handshake = 0;
var current = 0;

CLIENTS=[];

const app = express();

app.use(function (req, res) {
    res.send({ msg: "hello" });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function clearArray(array) {
    while (array.length) {
        array.pop();
    }
}

function refreshAll(){
    if(CLIENTS.length == 2) {
        clearArray(CLIENTS);
        clearArray(randomList);
    }

    clearArray(ships);
    clearArray(firstclient);
    clearArray(hitplaces);

    handshake = 0;
    state = 'DEPLOY';
    ships = [[],[]];
    me_2 = 0;
    me_1 = 0;
}

function requestHandler(req, res) {
    var fileName = "/" + path.basename(req.url);
    if (fileName.endsWith("/")) {
        fileName += "index.html";
    }

    if (fs.existsSync(__dirname + fileName)) {
        fs.readFile(__dirname + fileName, function (err, contents) {
            if (!err) {
                res.end(contents);
            } else {
                console.dir(err);
            }
        });
    } else {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("<h1>Sorry, the page you are looking for cannot be found.</h1>");
    }
}

wss.on('connection', function connection(ws, req) {

    const location = url.parse(req.url, true);

    console.log("A user connected");

    ws.number = Math.floor(Math.random() * 2) + 1;

    if (randomList.indexOf(parseInt(ws.number)) == -1) {
        randomList.push(ws.number);
    }

    else {
        if (ws.number == 1) ws.number = 2;
        else ws.number = 1;
        randomList.push(ws.number);
    }

    console.log("0. eleman: "+randomList[0]);
    console.log("1. eleman: "+randomList[1]);

    if(CLIENTS.length < 3) {
        CLIENTS.push(ws);
    }
    console.log("Current client number: "+CLIENTS.length);

    ws.send("My Number: "+ws.number);

    ws.on("message", function (message) {
        var first_player = 0;
        var second_player = 1;

        if (state == "DEPLOY") {

            if((message.indexOf("basla1") != -1)){
                handshake++;
            }

            if(message.indexOf("basla2") != -1){
                handshake++;
            }

            if(handshake == 2){
                sendAll("ok");
                sendAll("diz1");
            }

            if (message.indexOf("first") != -1) {
                firstclient.push(message.charAt(5));
            }

            else {
                if (message != "basla1" && message != "basla2") {
                    console.log("0 olması gerek: "+first_player);
                    console.log("0 olması gerek: "+ships[first_player].length);
                    if (ships[first_player].length < 10) {
                        ships[first_player].push(message);
                        console.log("First"+ships[first_player]);
                    }
                    if(ships[first_player].length == 10){
                        sendAll("diz2");
                    }
                    if(ships[first_player].length == 11 && ships[second_player].length < 10) {
                        ships[second_player].push(message);
                        console.log("Second"+ships[second_player]);
                    }
                    if(ships[first_player].length == 10){
                        ships[first_player].push("deneme");
                    }

                    if (ships[0].length == 11 && ships[1].length == 10) {
                        state = "WAR";
                        sendAll("start");
                        sendAll("turn1");
                        if (firstclient[0] == 1) opposite = 1;
                        else opposite = 0;
                        console.log("Random listten alınan opposite değeri " + opposite);
                    }
                }
            }
        }

        else if (state == "WAR") {

                if(programcount == 1) {
                    if (message.indexOf("turn") != -1) {
                        var turn = message.charAt(4);
                        if (turn == 1 ){
                            if(firstclient[0] == 1) {
                                opposite = 1;
                            }
                            else{
                                opposite = 0;
                            }
                        }
                        else if (turn == 2){
                            if(firstclient[0] == 1) {
                                opposite = 0;
                            }
                            else{
                                opposite = 1;
                            }
                        }
                        console.log("Yeni opposite " + opposite);
                        sendAll(message);
                    }
                }
                programcount = 1;

            // ilkinde her türlü arttır.
            if (ships[opposite].indexOf(message) != -1) {

                if(score_count == 0){
                    console.log("Skor ilki olduğu için arttı");
                    ws.send("hit");
                    if(firstclient[0] == 1 ){ if(opposite == 0) sendAll("vuruldun1"+message); else sendAll("vuruldun2"+message); }
                    else if (firstclient[0] == 2){ if(opposite == 1) sendAll("vuruldun2"+message); else sendAll("vuruldun1"+message); }
                    if (opposite == 0) me_2++;
                    else if (opposite == 1) me_1++;
                    //
                    if(firstclient[0] == 1 ){ if(opposite == 0)  hitplaces[0].push(message); else  hitplaces[1].push(message); }
                    else if (firstclient[0] == 2){ if(opposite == 1)  hitplaces[1].push(message);  hitplaces[0].push(message); }
                    console.log("0: "+hitplaces[0]);
                    console.log("1: "+hitplaces[1]);

                    score_count++;
                }

            // hitplaces'de mesaj varsa arttırma
                if(firstclient[0] == 1 ){ if(opposite == 0) current = 0; else current = 1;}
                else if (firstclient[0] == 2){ if(opposite == 1) current =1; else current = 0; }
                if(hitplaces[current].indexOf(message) == -1) {

                    ws.send("hit");
                    if(firstclient[0] == 1 ){ if(opposite == 0)  hitplaces[0].push(message); else  hitplaces[1].push(message); }
                    else if (firstclient[0] == 2){ if(opposite == 1)  hitplaces[1].push(message);  hitplaces[0].push(message); }
                    console.log("0: "+hitplaces[0]);
                    console.log("1: "+hitplaces[1]);

                    if(firstclient[0] == 1 ){ if(opposite == 0) sendAll("vuruldun1"+message); else sendAll("vuruldun2"+message); }
                    else if (firstclient[0] == 2){ if(opposite == 1) sendAll("vuruldun2"+message); else sendAll("vuruldun1"+message); }
                    if (opposite == 0) me_2++;
                    else if (opposite == 1) me_1++;
                    console.log("Me2 "+me_2);
                    console.log("Me1 "+me_1);
                }

                if (me_2 == 10 ) {
                   if(firstclient[0] == 1) { sendAll("finish2"); sendAll("lost1"); }
                    else { sendAll("finish1"); sendAll("lost2"); }
                    // 0. arrayda 1 numaralı 1. arrayde 2 numaralı var ws.send("finish2");
                }
                else if(me_1 == 10){
                    if(firstclient[0] == 1){ sendAll("finish1"); sendAll("lost2"); }
                    else { sendAll("finish2"); sendAll("lost1"); }
                }
            }

            if(message.indexOf("turn") == -1 && ships[opposite].indexOf(message) == -1){
                if(firstclient[0] == 1 ){ if(opposite == 0) sendAll("vuruldun1"+message); else sendAll("vuruldun2"+message); }
                else if (firstclient[0] == 2){ if(opposite == 1) sendAll("vuruldun2"+message); else sendAll("vuruldun1"+message); }
                ws.send("miss");
            }
        }
    });

    ws.on("close",function(){
        console.log("A user disconnected");
        refreshAll();
        console.log("Current client number: "+CLIENTS.length);
    });

});


server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});

function sendAll(message){
    for(var i=0;i<CLIENTS.length;i++){
        CLIENTS[i].send(message);
    }
}