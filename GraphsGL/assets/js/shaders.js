class ShaderInit {
    static loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    static initShaderProgram(gl, vertexSource, fragmentSource) {
        const vertexShader = ShaderInit.loadShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = ShaderInit.loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }

    static resizeCanvas(canvas) {
        let displayWidth = canvas.clientWidth;
        let displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
    }
}

function initBuffers(gl, positions) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

const vertexSourcePoints = `
attribute vec4 aPosition;

uniform mat4 uMatrix;

varying vec4 vColor;

void main() {
    gl_Position = uMatrix * aPosition;
    gl_PointSize = 4.0;

    vColor = vec4(0.2, 0.2, 1, 1);
}
`;

const fragmentSourcePoints = `
    precision mediump float;
    varying vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
`;

const vertexSourceFog = `
attribute vec4 aPosition;

uniform mat4 uMatrix;
uniform mat4 uPerspective;

varying float vFogDepth;

void main() {
    gl_Position = uPerspective * uMatrix * aPosition;
    gl_PointSize = 4.0;

    vFogDepth = -(uMatrix * aPosition).z;
}
`;

const fragmentSourceFog = `
    precision mediump float;

    varying float vFogDepth;

    void main() {
      float fogAmount = smoothstep(1000.0, 5000.0, vFogDepth);

      gl_FragColor = vec4(0.2, 0.2, 1, 1);
      gl_FragColor = mix(gl_FragColor, vec4(0.5, 0.5, 0.8, 1), fogAmount);
    }
`;

const vertexSourceLightning = `
attribute vec4 aPosition;
attribute vec3 aNormal;

uniform mat4 uMatrix;
uniform mat4 uPerspective;

varying float vFogDepth;
varying vec3 vNormal;

void main() {
    gl_Position = uPerspective * uMatrix * aPosition;
    gl_PointSize = 4.0;

    vFogDepth = -(uMatrix * aPosition).z;
    vNormal = aNormal;
}
`;

const fragmentSourceLightning = `
precision mediump float;

uniform vec3 uReverseLightDirection;
uniform float uAmbient;

varying float vFogDepth;
varying vec3 vNormal;

void main() {
  float fogAmount = smoothstep(1000.0, 5000.0, vFogDepth);
  vec3 normal = normalize(vNormal);

  float light = dot(normal, uReverseLightDirection);

  gl_FragColor = vec4(0.2, 0.2, 1, 1);
  gl_FragColor.rgb *= max(min(light + uAmbient, 1.5), uAmbient);
  gl_FragColor = mix(gl_FragColor, vec4(0.5, 0.5, 0.8, 1), fogAmount);
}
`;

let m4 = {

    perspective: function (fieldOfViewInRadians, aspect, near, far) {
      let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
      let rangeInv = 1.0 / (near - far);
  
      return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
      ];
    },
  
    projection: function (width, height, depth) {
      // Note: This matrix flips the Y axis so 0 is at the top.
      return [
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
      ];
    },
  
    identity: function () {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]
    },
  
    normalize: function (v) {
      let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
      } else {
        return [0, 0, 0];
      }
    },
  
    multiply: function (a, b) {
      let a00 = a[0 * 4 + 0];
      let a01 = a[0 * 4 + 1];
      let a02 = a[0 * 4 + 2];
      let a03 = a[0 * 4 + 3];
      let a10 = a[1 * 4 + 0];
      let a11 = a[1 * 4 + 1];
      let a12 = a[1 * 4 + 2];
      let a13 = a[1 * 4 + 3];
      let a20 = a[2 * 4 + 0];
      let a21 = a[2 * 4 + 1];
      let a22 = a[2 * 4 + 2];
      let a23 = a[2 * 4 + 3];
      let a30 = a[3 * 4 + 0];
      let a31 = a[3 * 4 + 1];
      let a32 = a[3 * 4 + 2];
      let a33 = a[3 * 4 + 3];
      let b00 = b[0 * 4 + 0];
      let b01 = b[0 * 4 + 1];
      let b02 = b[0 * 4 + 2];
      let b03 = b[0 * 4 + 3];
      let b10 = b[1 * 4 + 0];
      let b11 = b[1 * 4 + 1];
      let b12 = b[1 * 4 + 2];
      let b13 = b[1 * 4 + 3];
      let b20 = b[2 * 4 + 0];
      let b21 = b[2 * 4 + 1];
      let b22 = b[2 * 4 + 2];
      let b23 = b[2 * 4 + 3];
      let b30 = b[3 * 4 + 0];
      let b31 = b[3 * 4 + 1];
      let b32 = b[3 * 4 + 2];
      let b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },
  
    inverse: function (m, dst = new Float32Array(16)) {
      let m00 = m[0 * 4 + 0];
      let m01 = m[0 * 4 + 1];
      let m02 = m[0 * 4 + 2];
      let m03 = m[0 * 4 + 3];
      let m10 = m[1 * 4 + 0];
      let m11 = m[1 * 4 + 1];
      let m12 = m[1 * 4 + 2];
      let m13 = m[1 * 4 + 3];
      let m20 = m[2 * 4 + 0];
      let m21 = m[2 * 4 + 1];
      let m22 = m[2 * 4 + 2];
      let m23 = m[2 * 4 + 3];
      let m30 = m[3 * 4 + 0];
      let m31 = m[3 * 4 + 1];
      let m32 = m[3 * 4 + 2];
      let m33 = m[3 * 4 + 3];
      let tmp_0 = m22 * m33;
      let tmp_1 = m32 * m23;
      let tmp_2 = m12 * m33;
      let tmp_3 = m32 * m13;
      let tmp_4 = m12 * m23;
      let tmp_5 = m22 * m13;
      let tmp_6 = m02 * m33;
      let tmp_7 = m32 * m03;
      let tmp_8 = m02 * m23;
      let tmp_9 = m22 * m03;
      let tmp_10 = m02 * m13;
      let tmp_11 = m12 * m03;
      let tmp_12 = m20 * m31;
      let tmp_13 = m30 * m21;
      let tmp_14 = m10 * m31;
      let tmp_15 = m30 * m11;
      let tmp_16 = m10 * m21;
      let tmp_17 = m20 * m11;
      let tmp_18 = m00 * m31;
      let tmp_19 = m30 * m01;
      let tmp_20 = m00 * m21;
      let tmp_21 = m20 * m01;
      let tmp_22 = m00 * m11;
      let tmp_23 = m10 * m01;
  
      let t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
      let t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
      let t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
      let t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
  
      let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
  
      dst[0] = d * t0;
      dst[1] = d * t1;
      dst[2] = d * t2;
      dst[3] = d * t3;
      dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
      dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
      dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
      dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
      dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
      dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
      dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
      dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
      dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
      dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
      dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
      dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));
  
      return dst;
    },
  
    translation: function (tx, ty, tz) {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1,
      ];
    },
  
    xRotation: function (angleInRadians) {
      let c = Math.cos(angleInRadians);
      let s = Math.sin(angleInRadians);
  
      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    yRotation: function (angleInRadians) {
      let c = Math.cos(angleInRadians);
      let s = Math.sin(angleInRadians);
  
      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    zRotation: function (angleInRadians) {
      let c = Math.cos(angleInRadians);
      let s = Math.sin(angleInRadians);
  
      return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
    },
  
    scaling: function (sx, sy, sz) {
      return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
      ];
    },
  
    translate: function (m, tx, ty, tz) {
      return m4.multiply(m, m4.translation(tx, ty, tz));
    },
  
    xRotate: function (m, angleInRadians) {
      return m4.multiply(m, m4.xRotation(angleInRadians));
    },
  
    yRotate: function (m, angleInRadians) {
      return m4.multiply(m, m4.yRotation(angleInRadians));
    },
  
    zRotate: function (m, angleInRadians) {
      return m4.multiply(m, m4.zRotation(angleInRadians));
    },
  
    scale: function (m, sx, sy, sz) {
      return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
  
  };
  