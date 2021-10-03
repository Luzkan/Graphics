// Canvas will have name canvasThing to avoid typing this whole command
const canvas = document.getElementById("myCanvas");
const gl = canvas.getContext("webgl");
const canvasX = document.querySelector('input[name="canvasX"]');
const canvasY = document.querySelector('input[name="canvasY"]');

// Resizing the canvas with two inputs and a button
// document.getElementById("resizeCanvasBtn").addEventListener("click", function(event){
//     event.preventDefault();
//     canvas.width = Number(canvasX.value);
//     canvas.height = Number(canvasY.value);
//     gl.canvas.width = Number(canvasX.value);
//     gl.canvas.height = Number(canvasY.value);

//     console.log("Hej");
//     resizeCanvas(gl, gl.canvas);
// });

// Matrix creation text field
// document.getElementById("userCmdBtn").addEventListener("click", function(event){
//     let usercmd = document.querySelector('input[name="userCmd"]').value;
//     console.log(usercmd.split(", "));   
//     cmdHandler(usercmd.split(", "));  
// });

window.addEventListener('load', main);

// Vertex shader program
var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec4 a_color;',
'uniform vec2 u_resolution;',
'varying vec4 v_color;',
'',
'void main()',
'{',
'  vec2 zeroToOne = vertPosition / u_resolution;',
'  vec2 zeroToTwo = zeroToOne * 2.0;',
'  vec2 clipSpace = zeroToTwo - 1.0;',
'  ',
'  gl_PointSize = 1.0;',
'  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',
'  v_color = a_color;',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'varying vec4 v_color;',
'',
'void main()',
'{',
'  gl_FragColor = v_color;',
'}'
].join('\n');

class BuffersDraw {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;

        this.program = createProgram(this.gl, vertexShader, fragmentShader);
        this.colorBuffer = null;
        this.positionBuffer = null;

        this.drawCount = 0;

        this.positionLocation = this.gl.getAttribLocation(this.program, 'vertPosition');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    }

    bufferColors(colors) { // [r1, g2, b1, a1, r2, g2, b2, a2, ...]
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    bufferPositions(positions) { // [x1, y1, x2, y2, x3, y3, ...]
        this.drawCount = positions.length / 2;
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    draw(primitiveType) {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        // positions
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        let size = 2;
        let type = this.gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        this.gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

        // colors
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        size = 4;
        type = this.gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;
        this.gl.vertexAttribPointer(this.colorLocation, size, type, normalize, stride, offset);

        this.gl.drawArrays(primitiveType, 0, this.drawCount);
    }

    getInfo() {
        let res = {
            attributes: [],
            uniforms: []
        };
        let indices = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        while (indices-->0) res.attributes.push(this.gl.getActiveAttrib(this.program, indices));
        indices = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        while (indices-->0) res.uniforms.push(this.gl.getActiveUniform(this.program, indices));
        return res;
    }
}

async function main() {
    const current = document.getElementById('current');
	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}
	if (!gl) {
		alert('Your browser does not support WebGL');
	}

    let type = gl.POINTS;
    let changed = false;
    document.getElementById('drawTypeButtons').addEventListener('click', event => {
        if (event.target.id) {
            current.textContent = `Drawing with method: ${event.target.id}`;
            const name = event.target.id.toUpperCase();
            type = gl[name];
            changed = true;
        }
    });

    const drawables = [];
    const MAX_LENGTH = 300;
    const position = {
        drag: false,
        moved: false,
        x: 0,
        y: 0
    };

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

    resizeCanvas(gl, gl.canvas);

    const buffersDraw = new BuffersDraw(gl, vertexShader, fragmentShader);

    function updatePos(event) {
        event.preventDefault();
        if (position.drag) {
            changed = true;
            if (drawables.length >= MAX_LENGTH) {
                drawables.shift();
            }
            drawables.push({
                position: [event.offsetX, event.offsetY],
                color: [Math.random(), Math.random(), Math.random(), 1]
            });
        }
    }
    canvas.addEventListener('mousemove', updatePos);
    canvas.addEventListener('mousedown', e => {
        position.drag = true;
        changed = true;
        updatePos(e);
    });
    canvas.addEventListener('mouseup', () => position.drag = false);
    canvas.addEventListener('mouseout', () => position.drag = false);

    function drawLoop() {
        if (changed) {
            changed = false;
            buffersDraw.bufferPositions(drawables.reduce((a, e) => [...a, ...e.position], []));
            buffersDraw.bufferColors(drawables.reduce((a, e) => [...a, ...e.color], []));
            buffersDraw.draw(type);
            console.log(buffersDraw.getInfo());
        }
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
}

function resizeCanvas(gl, canvasElement) {
    let displayWidth = canvasElement.clientWidth;
    let displayHeight = canvasElement.clientHeight;

    if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
        canvasElement.width = displayWidth;
        canvasElement.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    } else {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
}

var InitDemo = function () {
    main();
}