class DrawPoints {
    constructor(gl, nfun, triforce) {
        this.gl = gl;
        this.program = ShaderInit.initShaderProgram(this.gl, vertexSourcePoints, fragmentSourcePoints);
        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, 'uMatrix')
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, 'aPosition')
        };
        this.graph = new GraphPoints(this.gl, nfun, triforce);
        this.objectsToDraw = [this.graph];
    }

    drawScene(triangles) {
        ShaderInit.resizeCanvas(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.useProgram(this.program);
        this.objectsToDraw.forEach(object => {
            this.gl.enableVertexAttribArray(this.attribs.aPosition);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.positionBuffer);
            let size = 3;
            let type = this.gl.FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            this.gl.vertexAttribPointer(this.attribs.aPosition, size, type, normalize, stride, offset);
            let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            let fov = Math.PI / 4;
            let matrix = m4.perspective(fov, aspect, 1, 10000);
            matrix = m4.xRotate(matrix, object.rotation[0]);
            matrix = m4.yRotate(matrix, object.rotation[1]);
            matrix = m4.translate(matrix, object.translation[0], object.translation[1], object.translation[2]);
            this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
            if (triangles) {
                this.gl.drawArrays(this.gl.TRIANGLES, 0, object.positions.length / 3);
            } else {
                this.gl.drawArrays(this.gl.POINTS, 0, object.positions.length / 3);
            }
        });
    }
}

class GraphPoints {
    constructor(gl, nfun, triforce) {
        this.size = 1000;
        this.acc = 50;
        this.positions = this.generatePlot([-5, 5], [-5, 5], nfun, triforce);
        this.positionBuffer = initBuffers(gl, this.positions);
        this.color = [1, 0, 0, 1];
        this.translation = [0, 0, -2000];
        this.rotation = [0, 0, 0];
    }

    generatePlot(xRange, yRange, fun, triangles) {
        let graph = [];
        for (let x = 0; x < this.acc; x++) {
            for (let y = 0; y < this.acc; y++) {
                let value = fun(xRange[0] + x * (xRange[1] - xRange[0]) / this.acc, yRange[0] + y * (yRange[1] - yRange[0]) / this.acc);
                if (triangles) {
                    let nextY = null;
                    let nextX = null;
                    let nextYX = null;
                    if (y !== this.acc - 1) nextY = fun(xRange[0] + x * (xRange[1] - xRange[0]) / this.acc, yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.acc);
                    if (x !== this.acc - 1) nextX = fun(xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.acc, yRange[0] + y * (yRange[1] - yRange[0]) / this.acc);
                    if (x !== this.acc - 1 && y !== this.acc - 1) nextYX = fun(xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.acc, yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.acc);
                    if (nextX !== null && nextY !== null && nextYX !== null) {
                        graph.push(x * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, value,
                            (x + 1) * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, nextX,
                            x * this.size / this.acc - this.size / 2, (y + 1) * this.size / this.acc - this.size / 2, nextY,
                            (x + 1) * this.size / this.acc - this.size / 2, (y + 1) * this.size / this.acc - this.size / 2, nextYX,
                            (x + 1) * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, nextX,
                            x * this.size / this.acc - this.size / 2, (y + 1) * this.size / this.acc - this.size / 2, nextY);
                    }
                } else {
                    graph.push(x * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, value);
                }
            }
        }
        const scaleFactor = this.size / Math.abs(xRange[1] - xRange[0]);
        graph = graph.map((p, i) => i % 3 === 2 ? p * scaleFactor : p);
        return graph;
    }
}
