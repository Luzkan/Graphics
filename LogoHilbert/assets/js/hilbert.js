document.getElementById("userHilbertButton").addEventListener("click", function(event){
    console.log("Drawing Hilbert!");   
    hilbertCurve();
});

document.getElementsByName("userHilbertDegree")[0].addEventListener("input", function(event){
    let stepFill = (Math.min(canvasThing.width, canvasThing.height))/((Math.pow(2, this.value)-1))
    document.getElementsByName("userHilbertStep")[0].value=stepFill 
});

function hilbertCurve () {
    var min = Math.min(canvasThing.width, canvasThing.height);
    var ctx = canvasThing.getContext("2d");
    
    var iterations = document.querySelector('input[name="userHilbertDegree"]').value;
    var stepLength = (document.querySelector('input[name="userHilbertStep"]').value);
    var x,y;
    var colorAngle = 0;

    x = 0;
    y = canvasThing.height;  
    hilbert(0, 1, iterations); 
    
        
    function drawStep(direction) {
        ctx.strokeStyle = "hsl(" + colorAngle + ", 100%, 50%)";
        colorAngle = (colorAngle + 0.007) % 360;
        ctx.beginPath();
        ctx.moveTo(x, y);
        switch (direction) {
        case 0:
            x += stepLength;
            break;
        case 1:
            y -= stepLength;
            break;
        case 2:
            x -= stepLength;
            break;
        case 3:
            y += stepLength;
            break;
        default:
            console.log("Invalid Direction: " + direction);
            break;
        }
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function drawStepTurtle(direction) {
        switch (direction) {
        case 0:
            turtleR = 0;
            break;
        case 1:
            turtleR = 270;
            break;
        case 2:
            turtleR = 180;
            break;
        case 3:
            turtleR = 90;
            break;
        default:
            console.log("Invalid Direction: " + direction);
            break;
        }
        
        ctx.strokeStyle = "hsl(" + colorAngle + ", 100%, 50%)";
        turtleC = colorAngle;
        colorAngle = (colorAngle + 0.007) % 360;
        startDraw(stepLength);
    }
    
    function setDirection(direction) {
        if(direction === -1) {
        return 3;
        } if(direction === 4) {
        return 0;
        } else {
        return direction;
        }
    }
    
    function hilbert(direction, rotation, iteration) {
        if (iteration === 0) {
        return; 
        } 

        direction = setDirection(direction + rotation); 
        hilbert(direction, -rotation, iteration - 1); 
        drawStepTurtle(direction); 
        direction = setDirection(direction - rotation); 
        hilbert(direction, rotation, iteration - 1); 
        drawStepTurtle(direction); 
        hilbert(direction, rotation, iteration - 1); 
        direction = setDirection(direction - rotation); 
        drawStepTurtle(direction); 
        hilbert(direction, -rotation, iteration - 1); 
    } 

    function hilbertTest(direction, rotation, iteration) {
        if (iteration === 0) {
        return; 
        } 

        direction = setDirection(direction + rotation); 
        hilbertTest(direction, -rotation, iteration - 1); 
        drawStep(direction); 
        direction = setDirection(direction - rotation); 
        hilbertTest(direction, rotation, iteration - 1); 
        drawStep(direction); 
        hilbertTest(direction, rotation, iteration - 1); 
        direction = setDirection(direction - rotation); 
        drawStep(direction); 
        hilbertTest(direction, -rotation, iteration - 1); 
    } 
}