class DrawLight {
    constructor(gl) {
        this.gl = gl;
        this.program = ShaderInit.initShaderProgram(this.gl, vertexSourceLightning, fragmentSourceLightning);
        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, 'uMatrix'),
            uPerspective: gl.getUniformLocation(this.program, 'uPerspective'),
            uAmbient: gl.getUniformLocation(this.program, 'uAmbient'),
            uReverseLightDirection: gl.getUniformLocation(this.program, 'uReverseLightDirection')
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, 'aPosition'),
            aNormal: gl.getAttribLocation(this.program, 'aNormal')
        };
        this.graph = new GraphLightning(this.gl);
        this.objectsToDraw = [this.graph];
    }

    drawScene() {
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
            this.gl.enableVertexAttribArray(this.attribs.aNormal);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.normalsBuffer);
            this.gl.vertexAttribPointer(this.attribs.aNormal, size, type, normalize, stride, offset);
            let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            let fov = Math.PI / 4;
            let perspective = m4.perspective(fov, aspect, 1, 5000);
            let matrix = m4.identity();
            matrix = m4.xRotation(object.rotation[0]);
            matrix = m4.yRotate(matrix, object.rotation[1]);
            matrix = m4.translate(matrix, object.translation[0], object.translation[1], object.translation[2]);
            this.gl.uniformMatrix4fv(this.uniforms.uPerspective, false, perspective);
            this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
            this.gl.uniform1f(this.uniforms.uAmbient, 0.5);
            this.gl.uniform3fv(this.uniforms.uReverseLightDirection, m4.normalize([0.5, 0.7, 1]));
            this.gl.drawArrays(this.gl.TRIANGLES, 0, object.positions.length / 3);
        });
    }
}

class GraphLightning {
    constructor(gl) {
        this.gl = gl;
        this.size = 1000;
        this.acc = 500;
        this.positions = [];
        this.normals = [];
        this.positionBuffer;
        this.normalsBuffer;
        this.translation = [0, 0, -2000];
        this.rotation = [0, 0, 0];
        this.generatePlot([-6, 6], [6, 6], (x, y) => Math.cos(x*2 + y/2));
    }

    triangleNormal(triangle, swap = false) {
        let U = [triangle[3] - triangle[0], triangle[4] - triangle[1], triangle[5] - triangle[2]];
        let V = [triangle[6] - triangle[0], triangle[7] - triangle[1], triangle[8] - triangle[2]];
        if (swap) [U, V] = [V, U];
    
        return [ U[1] * V[2] - U[2] * V[1],
                 U[2] * V[0] - U[0] * V[2],
                 U[0] * V[1] - U[1] * V[0]];
    }

    generatePlot(xRange, yRange, fun) {
        console.log(fun)
        this.positions = [];
        this.normals = [];
        const scaleFactor = this.size / Math.abs(xRange[1] - xRange[0]);
        for (let x = 0; x < this.acc; x++) {
            for (let y = 0; y < this.acc; y++) {
                let value = fun(xRange[0] + x * (xRange[1] - xRange[0]) / this.acc,yRange[0] + y * (yRange[1] - yRange[0]) / this.acc) * scaleFactor;
                let nextY = null;
                let nextX = null;
                let nextYX = null;
                if (y !== this.acc - 1) nextY = fun(xRange[0] + x * (xRange[1] - xRange[0]) / this.acc, yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.acc) * scaleFactor;
                if (x !== this.acc - 1) nextX = fun(xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.acc, yRange[0] + y * (yRange[1] - yRange[0]) / this.acc ) * scaleFactor;
                if (x !== this.acc - 1 && y !== this.acc - 1) nextYX = fun(xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.acc, yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.acc) * scaleFactor;
                if (nextX !== null && nextY !== null && nextYX !== null) {
                    const firstTriangle = [x * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, value,
                                          (x + 1) * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, nextX,
                                          x * this.size / this.acc - this.size / 2, (y + 1) * this.size / this.acc - this.size / 2, nextY];

                    const secondTriangle = [(x + 1) * this.size / this.acc - this.size / 2, (y + 1) * this.size / this.acc - this.size / 2, nextYX,
                                           (x + 1) * this.size / this.acc - this.size / 2, y * this.size / this.acc - this.size / 2, nextX,
                                           x * this.size / this.acc - this.size / 2, (y + 1) * this.size / this.acc - this.size / 2, nextY];

                    this.positions.push(...firstTriangle, ...secondTriangle);
                    this.normals.push(...this.triangleNormal(firstTriangle), ...this.triangleNormal(firstTriangle), ...this.triangleNormal(firstTriangle),
                                      ...this.triangleNormal(secondTriangle, true), ...this.triangleNormal(secondTriangle, true), ...this.triangleNormal(secondTriangle, true));
                }
            }
        }
        this.positionBuffer = initBuffers(this.gl, this.positions);
        this.normalsBuffer = initBuffers(this.gl, this.normals);
    }
}

