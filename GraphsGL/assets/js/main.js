window.onload = main;
const dimensionInput = document.getElementById('diminput');
const equationInput = document.getElementById('equinput');
const colorInput = document.getElementById('colorinput');
const xRangeInput = document.getElementById('xrninput');
const yRangeInput = document.getElementById('yrninput');

const drawNow = document.getElementById('drawbtn');
const cnvsdiv = document.getElementById('cnvsdiv');
const canvas = document.getElementById('canvas');

const ckb1 = document.getElementById('ckb1');
const ckb2 = document.getElementById('ckb2');
const ckb3 = document.getElementById('ckb3');

const gl = canvas.getContext('webgl');
let drawType = 3;
let useTriangles = false;

function trianglesUsage(){
    useTriangles = (useTriangles === true) ? false : true;
}

function changeDraw(type){
    drawType = type;
    switch(type){
        case 3:
            ckb1.checked = false;
            ckb2.checked = false;
            break;
        case 2:
            ckb1.checked = false;
            ckb3.checked = false;
            break;
        case 1:
            ckb2.checked = false;
            ckb3.checked = false;
            break;
    }
}

function whatDraw(nfun, useTriangles){
    g = new DrawLight(gl);
    switch(drawType){
        case 3:
            console.log("Drawing Lightning!");
            ckb2.checked = false;
            ckb1.checked = false;
            break;
        case 2:
            console.log("Drawing Fog!");
            ckb3.checked = false;
            ckb1.checked = false;
            g = new DrawFog(gl, nfun, useTriangles);
            break;
        case 1:
            console.log("Drawing Points!");
            ckb3.checked = false;
            ckb2.checked = false;
            g = new DrawPoints(gl, nfun, useTriangles);
            break;
    }
    return g;
}

function main() {
    canvas.height = window.innerHeight-10;
    canvas.width = window.innerWidth-520-18;
    if (!gl) return;
    let input = [];
    let g = whatDraw();
    let redraw = true;

    window.addEventListener("keydown", event => input[event.which] = true);
    window.addEventListener("keyup", event => input[event.which] = false);
    ShaderInit.resizeCanvas(g.gl.canvas);
    
    drawNow.addEventListener("click", function(){
        let fun = eval(`${dimensionInput.value} => ${equationInput.value}`);
        g = whatDraw(fun, useTriangles);
        g.graph.generatePlot(eval(xRangeInput.value), eval(yRangeInput.value), fun, useTriangles);
        redraw = true;
    });

    function render() {
        if (input[38]) g.graph.rotation[0] -= 0.015, redraw = true;     // Up
        if (input[40]) g.graph.rotation[0] += 0.015, redraw = true;     // Down
        if (input[39]) g.graph.rotation[1] += 0.015, redraw = true;     // Right
        if (input[37]) g.graph.rotation[1] -= 0.015, redraw = true;     // Left
        if (input[87]) g.graph.translation[2] += 15, redraw = true;     // W
        if (input[83]) g.graph.translation[2] -= 15, redraw = true;     // S
        if (input[68]) g.graph.translation[0] -= 15, redraw = true;     // D
        if (input[65]) g.graph.translation[0] += 15, redraw = true;     // A
        if (input[69]) g.graph.translation[1] += 15, redraw = true;     // E
        if (input[81]) g.graph.translation[1] -= 15, redraw = true;     // Q
        if (redraw) g.drawScene(), redraw = false;
        requestAnimationFrame(render);
    }
    render();
}