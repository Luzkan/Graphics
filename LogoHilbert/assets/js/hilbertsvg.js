document.getElementById("userHilbertButtonSVG").addEventListener("click", function(event){
    console.log("Drawing Hilbert!");   
    hilbertCurveSVG();
});

document.getElementsByName("userHilbertDegree")[0].addEventListener("input", function(event){
    let stepFill = (Math.min(canvasThing.width, canvasThing.height))/((Math.pow(2, this.value)-1))
    document.getElementsByName("userHilbertStep")[0].value=stepFill 
});



var slider1 = document.querySelector('input[name="hilbertIteration"]');
var slider2 = document.querySelector('input[name="hilbertStepsSlider"]');
var output = document.getElementById("valueSlid");

slider1.oninput = function() {
  output.innerHTML = "Value: " + this.value;
}

slider2.oninput = function() {
    output.innerHTML = "Value: " + this.value;
  }



function hilbertCurveSVG () {

    
    var iterations = document.querySelector('input[name="hilbertIteration"]').value;

    

    console.log(iterations)

    var stepLength = Math.abs((document.querySelector('input[name="hilbertStepsSlider"]').value));
    let sizeSVG = stepLength*(2+(Math.pow(2, iterations)-1))

    var x,y;
    var colorAngle = 0;

    var points = [];

    x = 5;
    y = sizeSVG-5;  

    points.push((0+5) + "," + (sizeSVG-5));
    hilbertSVG(0, 1, iterations); 
    

    function drawStepSVG(direction) {
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
        points.push(x + "," + y)
    }
    
    function setDirectionSVG(direction) {
        if(direction === -1) {
        return 3;
        } if(direction === 4) {
        return 0;
        } else {
        return direction;
        }
    }
    
    function hilbertSVG(direction, rotation, iteration) {
        if (iteration === 0) {
        return; 
        } 

        direction = setDirectionSVG(direction + rotation); 
        hilbertSVG(direction, -rotation, iteration - 1); 
        drawStepSVG(direction); 
        direction = setDirectionSVG(direction - rotation); 
        hilbertSVG(direction, rotation, iteration - 1); 
        drawStepSVG(direction); 
        hilbertSVG(direction, rotation, iteration - 1); 
        direction = setDirectionSVG(direction - rotation); 
        drawStepSVG(direction); 
        hilbertSVG(direction, -rotation, iteration - 1); 
    } 

    
    
    let coords = ""

    points.forEach(setupForSVG);
    function setupForSVG(item, index) {
      coords += item + " "; 
    }

    console.log(coords);
    document.getElementById('divWithSVG').innerHTML = '<svg height="' + sizeSVG + '" width="' + sizeSVG + '"> <polyline points="' + coords + '" style="fill:white;stroke:red;stroke-width:4" /> </svg>'
}