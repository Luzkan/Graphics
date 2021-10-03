// Vertex shader program
var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 a_position;',
'attribute vec4 a_color;',
'varying vec4 v_color;',
'',
'void main()',
'{',
'  gl_Position = vec4((a_position - 0.5) * vec3(2), 1.0);',
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

class HilbertDrawer {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;

        this.program = createProgram(this.gl, vertexShader, fragmentShader);
        this.colorBuffer = null;
        this.positionBuffer = null;
        this.drawCounts = [];

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    }

    /**
     * Level {
     *     color: [r, g, b, a]
     *     positions: [x1, y1, z1, x2, y2, z2, ...] normalized
     * }
     * @param levels Level[]
     */
    bufferLevels(levels) {
        this.drawCounts = levels.map(l => l.positions.length / 3).reduce((a, e) => a + e, 0);

        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(levels.reduce((a, e) => [...a, ...new Array(e.positions.length / 3 * 4).fill(1).map((_, i) => e.color[i % e.color.length])],[])), this.gl.STATIC_DRAW);

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(levels.reduce((a, e) => [...a, ...e.positions], [])), this.gl.STATIC_DRAW);
    }

    draw() {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        this.gl.useProgram(this.program);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionLocation,3,this.gl.FLOAT,false,0,0);

        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(this.colorLocation,4,this.gl.FLOAT,false,0,0);

        this.gl.drawArrays(this.gl.LINES, 0, this.drawCounts);
    }
}

function generateHilbert(level, color, depth) {
    const res = {level: level, depth: depth, color: color, positions: []};
    let size = 2 ** level;
    let prev = {x: 0, y: 0};
    for (let i = 1; i < size * size; i++) {
        let result = hilbertCoord(i, size);
        res.positions.push(prev.x / (size - 1), prev.y / (size - 1), depth, result.x / (size - 1), result.y / (size - 1), depth);
        prev = result;
    }
    return res;
}

function updateHilbert(hilbert, newDepth, newColor) {
    if (newDepth !== undefined) {
        hilbert.depth = newDepth;
        hilbert.depth = Math.round(hilbert.depth * 100) / 100;
        for (let i = 2; i < hilbert.positions.length; i += 3) {
            hilbert.positions[i] = newDepth;
        }
    }
    if (newColor !== undefined) {
        console.log(hexToRgb(newColor));
        hilbert.color = hexToRgb(newColor);
    }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      1
     ] : null;
  }

function updateOptions(hilberts, d) {
    const container = document.getElementById('drawedHilbertsOptions');
    while (container.firstChild) container.removeChild(container.firstChild);
    hilberts.sort((a, b) => a.depth - b.depth).forEach(hilbert => {

        console.log(hilbert);

        const controls = document.createElement('div');
        const text = document.createElement('p');
        controls.className = 'control';
        const lvlText = document.createElement('p'); lvlText.textContent = 'L: [' + hilbert.level + "]";
        const depthText = document.createElement('p'); depthText.textContent = 'D: [' + hilbert.depth + "]";
        const upButton = document.createElement('button'); upButton.textContent = 'Up';
        const downButton = document.createElement('button'); downButton.textContent = 'Down';
        const hexInput = document.createElement('input'); hexInput.value = hilbert.color.join(','); hexInput.type="text"; hexInput.className="colorPicker";
        

        const upDownDiv = document.createElement('div'); upDownDiv.className = 'up-down';

        downButton.addEventListener('click', () => {
            updateHilbert(hilbert, hilbert.depth + 0.1);
            updateOptions(hilberts, d);
            d.bufferLevels(hilberts);
            d.draw();
        });
        upButton.addEventListener('click', () => {
            updateHilbert(hilbert, hilbert.depth - 0.1);
            updateOptions(hilberts, d);
            d.bufferLevels(hilberts);
            d.draw();
        });
        hexInput.addEventListener('input', () => {
            let hex = hexInput.value;
            if (hex.length === 7) {
                updateHilbert(hilbert, undefined, hex);
                d.bufferLevels(hilberts);
                d.draw();
            }
        });
        upDownDiv.append(lvlText, upButton, downButton, depthText);
        controls.append(upDownDiv, hexInput);
        container.append(text, controls);

        // var source = document.getElementsByClassName('colorPicker');
        // // set hooks for each source element
        // for (var i = 0, len = source.length; i < len; ++i) {
        //     (new CP(source[i])).on("change", function(color) {
        //         this.source.value = '#' + color;
        //     });
        // }
    });
}

function hilbertCoord(index, level) {
    let positions = [[0, 0], [0, 1], [1, 1], [1, 0]];
    let [x, y] = positions[last2(index)];
    index = drop2(index);
    for (let i = 4; i <= level; i *= 2) {
        switch (last2(index)) {
            case 0:
                [x, y] = [y, x];
                break;
            case 1:
                y += i / 2;
                break;
            case 2:
                x += i / 2;
                y += i / 2;
                break;
            case 3:
                [y, x] = [i/2 - 1 - x, i - 1 - y];
                break;
        }
        index = drop2(index);
    }
    return {x: x, y: y};
}

async function main() {
    const hilberts = [];

    const button = document.getElementById('add');
    const level = document.getElementById('level');
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl');

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

    const d = new HilbertDrawer(gl, vertexShader, fragmentShader);
    button.addEventListener('click', () => {
        hilberts.push(generateHilbert(Number(level.value), [0, 0, 0, 1], 0.5));
        updateOptions(hilberts, d);
        d.bufferLevels(hilberts);
        d.draw();
    });

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

const last2 = x => x & 0b11;
const drop2 = x => x >>> 2;
