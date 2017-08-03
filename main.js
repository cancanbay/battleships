var ctx;
var btn4x = document.getElementById("xxxx");
var btn3x = document.getElementById("xxx");
var btn2x = document.getElementById("xx");
var btn1x = document.getElementById("x");
var canvas = document.getElementById("canvas");
var canvas2 = document.getElementById("canvas2");
var btn_start = document.getElementById("btn_start");
var div_choice = document.getElementById("choice");
var ships_control_places = [];
var ships_places = [];
var x_new;
var y_new;
var len = 0;
var blue_count = 0;
var coord;
var client_number = 0;
var ws = new WebSocket("ws://192.168.1.113:8080");
var blacklist_ships = [];
var blacklist_ships1 = [];
var dik = false;
var yan = false;
var dik_ters = false;
var yan_ters = false;
var first_length = [];
var hit_places = [];
var gemilerisec = document.getElementById("gemilerisec");
var first_length_count = 0;


function cleanButtons(e, length) {
    clearArray(ships_control_places);
    len = length;
    blue_count = 0;
    e.target.parentNode.removeChild(e.target);
}

btn4x.addEventListener("click", function (e) {
    cleanButtons(e, 4);
    btn3x.disabled = true;
    btn2x.disabled = true;
    btn1x.disabled = true;
}, false);

btn3x.addEventListener("click", function (e) {
    cleanButtons(e, 3);
    btn4x.disabled = true;
    btn2x.disabled = true;
    btn1x.disabled = true;
}, false);
btn2x.addEventListener("click", function (e) {
    cleanButtons(e, 2);
    btn4x.disabled = true;
    btn3x.disabled = true;
    btn1x.disabled = true;
}, false);
btn1x.addEventListener("click", function (e) {
    cleanButtons(e, 1);
    btn4x.disabled = true;
    btn3x.disabled = true;
    btn2x.disabled = true;
}, false);

canvas.addEventListener("click", function (e) {
    findCoordDrawX(e, len);
}, false);

btn_start.addEventListener("click",function(){
    btn_start.disabled = true;
    btn_start.firstChild.data = "Rakibiniz Bekleniyor";
    ws.send("basla"+client_number);
},false);

function h1Ekle(text) {
    var h1 = document.createElement('h1');
    h1.appendChild(document.createTextNode(text));
    var button = document.createElement("button");
    button.className = "btn btn-success";
    button.innerHTML = "Yeniden Oyna";
    div_choice.appendChild(h1);
    div_choice.appendChild(button);
    button.addEventListener ("click", function() {
        window.location.reload();
    });
}

function iterateForFirstAdmiralHorizontal() {
    for (var i = 0; i < 10; i++) {
        var j = (i * 46) + 33;
        ctx.font = "25px Arial";
        ctx.fillText(String.fromCharCode(i + 65), j, 20);
    }
}

function iterateForFirstAdmiralVertical() {
    for (var i = 0; i < 10; i++) {
        var j = (i * 46) + 46;
        ctx.font = "25px Arial";
        ctx.fillText(i + 1, 0, j);
    }
}

function init(canv) {

    ctx = canv.getContext("2d");

    ctx.beginPath();
    ctx.strokeStyle = "black";

    for (var i = 0; i <= 11; i++) {
        ctx.moveTo(i * 46 + 20.5, 20.5);
        ctx.lineTo(i * 46 + 20.5, 480.5);
    }

    for (i = 0; i <= 11; i++) {
        ctx.moveTo(20.5, i * 46 + 20.5);
        ctx.lineTo(480.5, i * 46 + 20.5);
    }

    ctx.stroke();

    iterateForFirstAdmiralHorizontal();
    iterateForFirstAdmiralVertical();

    div_choice.style.visibility = 'hidden';

}


function clearArray(array) {
    while (array.length) {
        array.pop();
    }
}

document.addEventListener("DOMContentLoaded", init(canvas));
init(canvas2);

function findCoord(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    x_new = String.fromCharCode(~~((x - 20) / 46) + 65);
    y_new = (~~((y - 20) / 46) + 1);
    hit_places.push(x_new + "-" + y_new);
    ws.send(x_new + "-" + y_new);
    ws.onmessage = function incoming(data) {

        if (data.data.indexOf("hit") != -1) {
            for (var k = 0; k < 5; k++) {
                drawX("green", x_new, y_new, canvas2);
            }
        }

        if (data.data.indexOf("finish" + client_number) != -1) {
            div_choice.style.color = "green";
            h1Ekle("KAZANDINIZ!");
            canvas2.removeEventListener("click", findCoord, false);
        }

        if (data.data.indexOf("turn" + client_number) != -1) {
            alert("Sıra sizde");
            canvas2.addEventListener("click", findCoord, false);
        }

        if (data.data == "miss") {
            for (var k = 0; k < 5; k++) {
                drawX("red", x_new, y_new, canvas2);
            }
            canvas2.removeEventListener("click", findCoord, false);
            if (client_number == 1) ws.send("turn2");
            else ws.send("turn1");
        }

        if(data.data.indexOf("vuruldun"+client_number) != -1){
            drawX("red",data.data.charAt(9),data.data.charAt(11),canvas);
        }

        if(data.data.indexOf("lost"+client_number) != -1){
            div_choice.style.color = "red";
            h1Ekle("KAYBETTİNİZ!");
        }

        if(data.data.indexOf("diz"+client_number) != -1){
            gemilerisec.parentNode.removeChild(gemilerisec);
            div_choice.style.visibility = 'visible';
        }

    };
}

function findCoordDrawX(event, length) {
    if (length != 0) {
        first_length.push(length);
        var x = event.offsetX;
        var y = event.offsetY;

        x_new = String.fromCharCode(~~((x - 20) / 46) + 65);
        y_new = (~~((y - 20) / 46) + 1);

        if (blue_count == 0 && blacklist_ships1.indexOf(x_new + y_new) == -1) {
            if (x >= 20 && x < 480 && y >= 20 && y < 480) {
                coord = x_new + "-" + y_new;
                ws.send("first" + client_number);
                ws.send(coord);
                ships_places.push(x_new + y_new);
                blacklist_ships.push(ships_places[0].charAt(0), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)) + 1);
                blacklist_ships.push(ships_places[0].charAt(0), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)) - 1);
                blacklist_ships.push(String.fromCharCode(ships_places[0].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)) + 1);
                blacklist_ships.push(String.fromCharCode(ships_places[0].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)));
                blacklist_ships.push(String.fromCharCode(ships_places[0].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)) - 1);
                blacklist_ships.push(String.fromCharCode(ships_places[0].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)) + 1);
                blacklist_ships.push(String.fromCharCode(ships_places[0].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)));
                blacklist_ships.push(String.fromCharCode(ships_places[0].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[0].charAt(1) + ships_places[0].charAt(2)) - 1);
                fillRect("blue", x_new, y_new, canvas);
                blue_count++;
                if (ships_control_places.length != 0) {
                    clearArray(ships_control_places);
                }
            }
        }

        else if (blacklist_ships1.indexOf(x_new + y_new) != -1 && blacklist_ships1.length > 0) {
            alert("Geminin yanına ya da üzerine çizemezsiniz..");
            len++;
            clearArray(ships_control_places);
        }

        if (ships_control_places[0] != null) {

            if (((x_new == ships_control_places[0] && Math.abs(y_new - ships_control_places[1]) == 1)
                || ((Math.abs(x_new.charCodeAt(0) - ships_control_places[0].charCodeAt(0)) == 1)
                && (ships_control_places[1] == y_new))) && (blacklist_ships1.indexOf(x_new + y_new) == -1)
                && !(ships_control_places[0] == x_new && ships_control_places[1] == y_new)) {

                if ((x_new == ships_control_places[0] && (y_new - ships_control_places[1]) == 1)) dik = true;
                else if ((x_new == ships_control_places[0] && (y_new - ships_control_places[1]) == -1)) dik_ters = true;
                else if((x_new.charCodeAt(0) - ships_control_places[0].charCodeAt(0) == -1) && (ships_control_places[1] == y_new)) yan_ters = true;
                else if ((x_new.charCodeAt(0) - ships_control_places[0].charCodeAt(0) == 1) && (ships_control_places[1] == y_new)) yan = true;

                clearArray(ships_control_places);
                fillRect("blue", x_new, y_new, canvas);
                    if (x >= 20 && x < 480 && y >= 20 && y < 480) {
                        coord = x_new + "-" + y_new;
                        ws.send(coord);
                        ships_places.push(x_new + y_new);
                    }
            }

            else {
                alert("Gemileri bitişik çizin..");
                alert("bence 2 "+first_length[0]);
                if(first_length[0] == 2){
                    if(first_length_count == 1){
                     len++;
                    }
                }
                   else {
                    len++;
                }

            }
        }
        ships_control_places.push(x_new);
        ships_control_places.push(y_new);
        if(first_length[0] != 2) {
            len--;
        }
        else{
            if(first_length_count == 1){
                len--;
            }
            first_length_count = 1;
        }

    }

    if (length != null && length == 1) {
        if (first_length[0] == 4) {
            btn3x.disabled = false;
            btn2x.disabled = false;
            btn1x.disabled = false;
            clearArray(first_length);
        }

        else if (first_length[0] == 3) {
            btn4x.disabled = false;
            btn2x.disabled = false;
            btn1x.disabled = false;
            clearArray(first_length);
        }

        else if (first_length[0] == 2) {
            btn4x.disabled = false;
            btn3x.disabled = false;
            btn1x.disabled = false;
            clearArray(first_length);
        }
        else if (first_length[0] == 1) {
            btn4x.disabled = false;
            btn3x.disabled = false;
            btn2x.disabled = false;
            clearArray(first_length);
        }

        for (var i = 0; i < ships_places.length; i++) {

            blacklist_ships.push(ships_places[i].charAt(0), ships_places[i].charAt(1));

            if (yan) {
                if (i == 0) {
                    blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                }
                else if (i == ships_places.length - 1) {
                    blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                }
                else {
                    blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                }
            }

            else if (dik) {

                if (i == 0) {
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2) - 1));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0)), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2) - 1));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2) - 1));
                }
                else if (i == ships_places.length - 1) {
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0)), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                }
                else {
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                }
            }

            else if(dik_ters){
                if (i == 0) {
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[ships_places.length-1-i].charAt(1) + ships_places[ships_places.length-1-i].charAt(2) - 1));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0)), parseInt(ships_places[ships_places.length-1-i].charAt(1) + ships_places[ships_places.length-1-i].charAt(2) - 1));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[ships_places.length-1-i].charAt(1) + ships_places[ships_places.length-1-i].charAt(2) - 1));
                }

                else if (i == ships_places.length - 1) {
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[ships_places.length-1-i].charAt(1) + ships_places[ships_places.length-1-i].charAt(2)) + 1);
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0)), parseInt(ships_places[ships_places.length-1-i].charAt(1) + ships_places[ships_places.length-1-i].charAt(2)) + 1);
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[ships_places.length-1-i].charAt(1) + ships_places[ships_places.length-1-i].charAt(2)) + 1);
                }

                else {
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                     blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + 1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                     }

            }

            else if(yan_ters){
               if (i == 0) {
                    blacklist_ships.push(ships_places[ships_places.length-1-i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(ships_places[ships_places.length-1-i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - ships_places.length-i), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - ships_places.length-i), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) - ships_places.length-i), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                }

               else if (i == ships_places.length - 1) {
                    blacklist_ships.push(ships_places[ships_places.length-i-1].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(ships_places[ships_places.length-i-1].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + i+1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + i+1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)));
                    blacklist_ships.push(String.fromCharCode(ships_places[i].charAt(0).charCodeAt(0) + i+1), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
                }

               else {
                   blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) + 1);
                   blacklist_ships.push(ships_places[i].charAt(0), parseInt(ships_places[i].charAt(1) + ships_places[i].charAt(2)) - 1);
               }

            }
        }

        clearArray(ships_places);

        for (var m = 0; m < blacklist_ships.length; m = m + 2) {
            blacklist_ships1[m] = blacklist_ships[m] + blacklist_ships[m + 1];
            console.log("Array elements: "+blacklist_ships1[m]);
        }

    }
    dik = false;
    yan = false;
    dik_ters = false;
    yan_ters = false;
}

function fillRect(fillStyle, x, y, canv) {
    ctx = canv.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = fillStyle;
    ctx.rect(25 + (x.charCodeAt(0) - "A".charCodeAt(0)) * 46 - 3, 25 + (y - 1) * 46 - 3, 43, 43);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.stroke();
}


function drawX(strokeStyle, x, y, canv) {
    ctx = canv.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(25 + (x.charCodeAt(0) - "A".charCodeAt(0)) * 46, 25 + (y - 1) * 46);
    ctx.lineTo(61 + (x.charCodeAt(0) - "A".charCodeAt(0)) * 46, 61 + (y - 1) * 46);
    ctx.moveTo(25 + (x.charCodeAt(0) - "A".charCodeAt(0)) * 46, 61 + (y - 1) * 46);
    ctx.lineTo(61 + (x.charCodeAt(0) - "A".charCodeAt(0)) * 46, 25 + (y - 1) * 46);
    ctx.stroke();
}
ws.onmessage = function incoming(data) {

    if (data.data.indexOf("My Number:") != -1) {
        client_number = data.data.charAt(11);
    }
    if (data.data.indexOf("turn" + client_number) != -1) {
        alert("Sıra sizde");
        canvas2.addEventListener("click", findCoord, false);
    }

    if (data.data.indexOf("finish" + client_number) != -1) {
        div_choice.style.color = "green";
        h1Ekle("KAZANDINIZ!");
        canvas2.removeEventListener("click", findCoord, false);
    }

    if(data.data.indexOf("lost"+client_number) != -1){
        div_choice.style.color = "red";
        h1Ekle("KAYBETTİNİZ!");
    }

    if(data.data.indexOf("ok") != -1){
    }

    if(data.data.indexOf("vuruldun"+client_number) != -1){
        drawX("red",data.data.charAt(9),data.data.charAt(11),canvas);
    }

    if(data.data.indexOf("diz"+client_number) != -1){
        btn_start.style.visibility = 'hidden';
        gemilerisec.parentNode.removeChild(gemilerisec);
        div_choice.style.visibility = 'visible';
    }

};