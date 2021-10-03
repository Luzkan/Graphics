// Canvas will have name canvasThing to avoid typing this whole command
const canvasThing = document.getElementById("myCanvas");
const canvasX = document.querySelector('input[name="canvasX"]');
const canvasY = document.querySelector('input[name="canvasY"]');
let drawWithTurtle = true;
let drawTurtleBody = false;

// Starting Turtle position
let turtleX = 0;
let turtleY = Number(canvasY.value);
let turtleR = 0;
let turtleC = "rgb(0,0,0)";

drawTurtle();

// Resizing the canvas with two inputs and a button
document.getElementById("resizeCanvasBtn").addEventListener("click", function(event){
    event.preventDefault();
    canvasThing.width = Number(canvasX.value);
    canvasThing.height = Number(canvasY.value);
    turtleX = 0;
    turtleY = Number(canvasY.value);
    turtleR = 0;
    drawTurtle();
});

// Turtle
function drawTurtle(){
    if(drawTurtleBody){
        let turtleSize = 10;
        var c = document.getElementById("myCanvas");
        var turtle = c.getContext("2d");
        turtle.beginPath();
        turtle.strokeStyle = "rgb(255,0,0,0.3)";
        turtle.rect((turtleX-(turtleSize/2)), (turtleY-(turtleSize/2)), turtleSize, turtleSize);
        turtle.stroke();
    }
}

// Drawing utility
function startDraw(move){
        var context = myCanvas.getContext('2d');
        context.beginPath();
        context.moveTo(turtleX, turtleY);
        
        console.log(turtleX, turtleY, toRadian(turtleR));

        turtleX += move*Math.cos(toRadian(turtleR));
        turtleY += move*Math.sin(toRadian(turtleR));

        console.log(turtleX, turtleY, toRadian(turtleR));

    if(drawWithTurtle == true){
        context.strokeStyle = turtleC;
        context.lineTo(turtleX, turtleY);
        context.stroke();
        drawTurtle();
    }
}

// OK Button
document.getElementById("userCmdBtn").addEventListener("click", function(event){
    let usercmd = document.querySelector('textarea[name="userCmd"]').value;
    console.log(usercmd.split(" "));   
    cmdHandler(usercmd.split(" "));         
});

document.getElementById("userClearCommandline").addEventListener("click", function(event){
	document.querySelector('textarea[name="userCmd"]').value = "";
});

// Command Handler
function cmdHandler(usercmd){
    for (let i = 0; i < usercmd.length;) {
        switch(usercmd[i]) {
            case "mv":
                let move = Number((usercmd[i + 1]));
                startDraw(move);
                i += 2;
                break;
            case 'r':
                let rotateRight = Number((usercmd[i + 1]));
                console.log("Rotation changed from: " + turtleR + " to: " + (turtleR + rotateRight));
                turtleR += rotateRight;
                i += 2;
                break;
            case 'l':
                let rotateLeft = Number((usercmd[i + 1]));
                console.log("Rotation changed from: " + turtleR + " to: " + (turtleR - rotateLeft));
                turtleR -= rotateLeft;
                i += 2;
                break;
            case 'e':

                console.log("Usercmd: " + usercmd);

                // Repeat looks up for the ")" that implies end of repeating code
                // ErrCheck looks if there was another "(" that implies more echoing code
                // We need to find the last ")" in order to echo the code correctly

                let repeat = usercmd.slice(i, usercmd.length).indexOf(")");
                let errCheck = usercmd.slice(i, usercmd.length).indexOf("(", 2);
                let toEcho = usercmd.slice(i+2, (i+repeat+2));

                console.log("i: " + i + " repeat: " + repeat);
                console.log("ErrCheck Index: " + errCheck);
                console.log("ToEcho: " + toEcho);

                while(errCheck != -1 && errCheck < repeat){
                    repeat = usercmd.slice(i, usercmd.length).indexOf(")", (repeat+1));
                    errCheck = usercmd.slice(i, usercmd.length).indexOf("(", (errCheck+1));
                    toEcho = usercmd.slice((i+2), (repeat));
                    console.log(repeat);
                    console.log(toEcho);
                }

                for (let k = 0; k < usercmd[i + repeat + 1]; k++){
                    cmdHandler(toEcho);
                }

                i += (repeat + 2);
                break;
            case 'c':
                let colorPicked = String((usercmd[i + 1]));
                pickColor(colorPicked);
                i += 2;
                break;
            case 'down':
                drawWithTurtle = true;
                document.getElementById("drawInfo").innerHTML = "Pencil: Down";
                i += 1;
                break;
            case 'up':
                drawWithTurtle = false;
                document.getElementById("drawInfo").innerHTML = "Pencil: Up";
                i += 1;
                break;
            default:
                console.log("Not a command: " + usercmd[i]);
                i += 1;
                break;
        }
    }
}

document.getElementById("drawTurtleCheckbox").addEventListener("click", function(event){
    if(this.checked) {
        drawTurtleBody = true;
        console.log("Drawing Turtle!");   
    } else {
        drawTurtleBody = false;
        console.log("Turtle will not be drawn!");   
    }
});

function toRadian(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
}

function pickColor(newColor){
    switch(newColor) {
        case "red":
            console.log("Picked color: " + newColor + ". Previous color: " + turtleC);
            turtleC = "rgb(255, 0, 0)";
            break;
        case "blue":
            console.log("Picked color: " + newColor + ". Previous color: " + turtleC);
            turtleC = "rgb(0, 0, 255)";
            break;
        case "yellow":
            console.log("Picked color: " + newColor + ". Previous color: " + turtleC);
            turtleC = "rgb(255, 255, 0)";
            break;
        case "green":
            console.log("Picked color: " + newColor + ". Previous color: " + turtleC);
            turtleC = "rgb(0, 255, 0)";
            break;
        case "brown":
            console.log("Picked color: " + newColor + ". Previous color: " + turtleC);
            turtleC = "rgb(160,82,45)";
            break;
        case "black":
            console.log("Picked color: " + newColor + ". Previous color: " + turtleC);
            turtleC = "rgb(0, 0, 0)";
            break;
        default:
            console.log("Color " + newColor + " is not defined!");
            break;
    }
}