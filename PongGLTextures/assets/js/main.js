const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

function main() {
    let pressedKeys = {};
    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    let pong = new Pong(gl);
    resizeCanvas(pong.gl.canvas);
    function gameUpdate() {
        
        if (pressedKeys["ArrowDown"] && pong.rightPaddle.translation[1] < 500)pong.rightPaddle.translation[1] += 7;
        if (pressedKeys["ArrowUp"] && pong.rightPaddle.translation[1] > 0) pong.rightPaddle.translation[1] -= 7;
        if (pressedKeys["s"] && pong.leftPaddle.translation[1] < 500) pong.leftPaddle.translation[1] += 7;
        if (pressedKeys["w"] && pong.leftPaddle.translation[1] > 0) pong.leftPaddle.translation[1] -= 7;
        pong.ball.translation[0] += pong.ball.dx;
        pong.ball.translation[1] += pong.ball.dy;
        
        pong.newStars.forEach(s => {
            s.translation[0] += s.dx;
            s.translation[1] += s.dy;
            s.checkCollision(pong.gl, pong);
        });
        pong.ball.checkCollision(pong.gl, pong);
        pong.drawScene();
        requestAnimationFrame(gameUpdate);
        
    }
    gameUpdate();
}

class Paddle {
    constructor(gl) {
        this.position = [
            0, 0,
            0, 100,
            10, 0,
            10, 0,
            10, 100,
            0, 100
        ];
        this.positionBuffer = initBuffers(gl, this.position);
        this.texcoordBuffer = initTextureBuffer(gl, this);
        this.textureSource = './assets/textures/cat3.jpg';
        this.texture = loadTexture(gl, this);
        this.offset = 6;
        this.width = 10;
        this.height = 100;
    }
}

class LeftPaddle extends Paddle {
    constructor(props) {
        super(props);
        this.translation = [30, 200];
    }
}

class RightPaddle extends Paddle {
    constructor(props) {
        super(props);
        this.translation = [960, 200];
    }
}

class Net {
    constructor(gl) {
        this.position = [
            0, 0,
            0, 1000,
            10, 0,
            10, 0,
            10, 1000,
            0, 1000
        ];
        this.positionBuffer = initBuffers(gl, this.position);
        this.texcoordBuffer = initTextureBuffer(gl, this);
        this.textureSource = './assets/textures/cat3.jpg';
        this.texture = loadTexture(gl, this);
        this.offset = 6;
        this.translation = [495, 0];
    }
}

class Ball {
    constructor(gl) {
        this.position = [
            0, 0,
            0, 10,
            10, 0,
            10, 0,
            10, 10,
            0, 10
        ];
        this.positionBuffer = initBuffers(gl, this.position);
        this.texcoordBuffer = initTextureBuffer(gl, this);
        this.textureSource = './assets/textures/cat3.jpg';
        this.texture = loadTexture(gl, this);
        this.offset = 6;
        this.translation = [495, 295];
        this.dx = -8;
        this.dy = -3;
        this.width = 10;
        this.height = 10;
    }

    checkCollision(gl, pong) {
        let points = document.getElementById('scoreText');
        let ballMaxY = this.translation[1] + this.height;
        let ballMinY = this.translation[1];
        let ballMaxX = this.translation[0] + this.width;
        let ballMinX = this.translation[0];

        let leftPaddleMaxY = pong.leftPaddle.translation[1] + pong.leftPaddle.height;
        let leftPaddleMinY = pong.leftPaddle.translation[1];
        let leftPaddleMaxX = pong.leftPaddle.translation[0] + pong.leftPaddle.width;

        let rightPaddleMaxY = pong.rightPaddle.translation[1] + pong.rightPaddle.height;
        let rightPaddleMinY = pong.rightPaddle.translation[1];
        let rightPaddleMinX = pong.rightPaddle.translation[0];

        // Top & Bottom Borders
        if (ballMinY <= 0) this.dy = -this.dy;
        if (ballMaxY >= gl.canvas.clientHeight) this.dy = -this.dy;

        // Left & Right Paddles
        if (ballMinX <= leftPaddleMaxX && ballMaxY >= leftPaddleMinY && ballMinY <= leftPaddleMaxY) this.dx = -this.dx;
        if (ballMaxX >= rightPaddleMinX && ballMaxY >= rightPaddleMinY && ballMinY <= rightPaddleMaxY) this.dx = -this.dx;

        // Left & Right Borders
        if (ballMinX <= 0) {
            this.translation = [495, 295];
            pong.rightScore++;
            points.innerText = `${pong.leftScore}:${pong.rightScore}`;
        }

        if (ballMaxX >= gl.canvas.clientWidth) {
            this.translation = [495, 295];
            pong.leftScore++;
            points.innerText = `${pong.leftScore}:${pong.rightScore}`;
        }
    }
}

class Pong {
    constructor(gl) {
        this.gl = gl;
        this.program = ShaderInit.initShaderProgram(this.gl, vertexSource, fragmentSource);

        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, 'uMatrix'),
            uTexture: gl.getUniformLocation(this.program, 'uTexture')
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, 'aPosition'),
            aTexcoord: gl.getAttribLocation(this.program, 'aTexcoord')
        };

        this.leftScore = 0;
        this.rightScore = 0;

        this.rightPaddle = new RightPaddle(gl);
        this.leftPaddle = new LeftPaddle(gl);
        this.net = new Net(gl);
        this.ball = new Ball(gl);
        const stars = generateStars(canvas);
        this.newStars = [];

        this.objectsToDraw = [this.rightPaddle, this.leftPaddle, this.net, this.ball];
        stars.forEach(s => {
            console.log(s.pointSize);
            this.star = new Star(gl, s.pointSize, s.depth);
            this.objectsToDraw.push(this.star);
            this.newStars.push(this.star);
        });

        this.star = new Star(gl, 5);
        this.objectsToDraw.push(this.star);
    }

    drawScene() {
        resizeCanvas(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.9, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.objectsToDraw.forEach(object => {
            this.gl.enableVertexAttribArray(this.attribs.aPosition);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.positionBuffer);
            let size = 2;
            let type = this.gl.FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            this.gl.vertexAttribPointer(this.attribs.aPosition, size, type, normalize, stride, offset);
            
            let matrix = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
            matrix = m3.translate(matrix, object.translation[0], object.translation[1]);
            this.gl.uniformMatrix3fv(this.uniforms.uMatrix, false, matrix);

            this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture);
            this.gl.uniform1i(this.uniforms.uTexture, 0);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, object.offset);



            this.gl.enableVertexAttribArray(this.attribs.aTexcoord);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.texcoordBuffer);

            this.gl.vertexAttribPointer(this.attribs.aTexcoord, size, type, normalize, stride, offset);




        });
    }
}

function loadTexture(gl, object) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255]));

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = object.textureSource;
    image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    return texture;
}


function generateRandomPoint(canvas) {
    let points = [];
    points.push(Math.random() * canvas.width, Math.random() * canvas.height);
    return points;
}
  
class Star {
    constructor(gl, starSize, starDepth) {
        this.position = [
            0, 0,
            0, starSize,
            starSize, 0,
            starSize, 0,
            starSize, starSize,
            0, starSize
        ];
        this.positionBuffer = initBuffers(gl, this.position);
        this.color = [0.2, 0.1, 0.4, 0.7];
        this.offset = 6;
        this.translation = [Math.random()*canvas.width, Math.random()*canvas.height];
        this.dx = whereToGo();
        this.dy = whereToGo();
        this.depth = starDepth;
        this.width = starSize;
        this.height = starSize;
    }

    checkCollision(gl) {
        let starMaxY = this.translation[1] + this.height;
        let starMinY = this.translation[1];
        let starMaxX = this.translation[0] + this.width;
        let starMinX = this.translation[0];

        // Top & Bottom Borders
        if (starMinY <= 0) this.dy = -this.dy;
        if (starMaxY >= gl.canvas.clientHeight) this.dy = -this.dy;

        // Left & Right Borders
        if (starMinX <= 0) this.dx = -this.dx;
        if (starMaxX >= gl.canvas.clientWidth) this.dx = -this.dx;
    }
}

function whereToGo(){
    if(Math.random() > 0.5) return Math.random();
    else return -(Math.random());
}

function generateStars(canvas) {
    let stars = [];
    for(let n = 0; n < 50; n++){
        for (let i = 0; i < 4; i++) {
            let s = generateRandomPoint(canvas);
            s.depth = i / 4;
            s.pointSize = 1.0 + (1 - i / 4) * 9;
            stars.push(s);
        }
    }
    return stars;
}
  
function initTextureBuffer(gl, object) {
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.texcoords), gl.STATIC_DRAW);

    return texcoordBuffer;
}

function initBuffers(gl, positions) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function resizeCanvas(canvas) {
    let displayWidth = canvas.clientWidth;
    let displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

var InitDemo = function () {
    main();
}
