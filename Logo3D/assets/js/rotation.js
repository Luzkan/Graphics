    // Unless otherwise noted by comments, all functions originate from the latest version of THREE.js (r84) 
    // https://github.com/mrdoob/three.js/tree/master
    // THREE.js is licensed under MIT (Copyright © 2010-2017 three.js authors)
    // 
    // Some functions have been changed by K Scandrett to work within this setting, 
    // but not the calculations.
    // Any mistakes are considered mine and not the authors of THREE.js. 
    // I provide no guarantees that I haven't created any bugs in reworking the original code
    // so use at your own risk. Enjoy the pizza.
    
    function please(v1, v2){

      // console.log(v1, " ", v2);
      // console.log(v1.x - v2.x);
    
      var startVec = {x: v1.x, y: v1.y, z: v1.z, w: 0};
      var endVec = {x: v2.x, y: v2.y, z: v2.z, w: 0};
      var upVec = {x: 0, y: 1, z: 0}; // y up
      
      var quat = lookAt(startVec, endVec, upVec);
      var angles = eulerSetFromQuaternion(quat);
      
      console.log(angles.x + " " + angles.y + " " + angles.z);
      var pleaseplease = {rotX: angles.x, rotY: angles.y, rotZ: angles.z}
      return pleaseplease
    }
    
    /* KS function */
    function magnitude(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    
    /* KS function */
    function normalize(v) {
      var mag = magnitude(v);
      return {
        x: v.x / mag,
        y: v.y / mag,
        z: v.z / mag
      };
    }
    
    function subVectors(a, b) {
      return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
      };
    }
    
    function crossVectors(a, b) {
      var ax = a.x,
        ay = a.y,
        az = a.z;
      var bx = b.x,
        by = b.y,
        bz = b.z;
      return {
        x: ay * bz - az * by,
        y: az * bx - ax * bz,
        z: ax * by - ay * bx
      };
    }
    
    function lengthSq(v) {
      return v.x * v.x + v.y * v.y + v.z * v.z;
    }
    
    
    function makeRotationFromQuaternion(q) {
    
      var matrix = new Float32Array([
    
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    
      ]);
    
      var te = matrix;
    
      var x = q.x,
        y = q.y,
        z = q.z,
        w = q.w;
      var x2 = x + x,
        y2 = y + y,
        z2 = z + z;
      var xx = x * x2,
        xy = x * y2,
        xz = x * z2;
      var yy = y * y2,
        yz = y * z2,
        zz = z * z2;
      var wx = w * x2,
        wy = w * y2,
        wz = w * z2;
    
      te[0] = 1 - (yy + zz);
      te[4] = xy - wz;
      te[8] = xz + wy;
    
      te[1] = xy + wz;
      te[5] = 1 - (xx + zz);
      te[9] = yz - wx;
    
      te[2] = xz - wy;
      te[6] = yz + wx;
      te[10] = 1 - (xx + yy);
    
      // last column
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
    
      // bottom row
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
    
      return te;
    
    }
    
    function RotationMatrix(m) {
    
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    
      var _w, _x, _y, _z;
      var te = m,
    
        m11 = te[0],
        m12 = te[4],
        m13 = te[8],
        m21 = te[1],
        m22 = te[5],
        m23 = te[9],
        m31 = te[2],
        m32 = te[6],
        m33 = te[10],
    
        trace = m11 + m22 + m33,
        s;
    
      if (trace > 0) {
    
        s = 0.5 / Math.sqrt(trace + 1.0);
    
        _w = 0.25 / s;
        _x = (m32 - m23) * s;
        _y = (m13 - m31) * s;
        _z = (m21 - m12) * s;
    
      } else if (m11 > m22 && m11 > m33) {
    
        s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
    
        _w = (m32 - m23) / s;
        _x = 0.25 * s;
        _y = (m12 + m21) / s;
        _z = (m13 + m31) / s;
    
      } else if (m22 > m33) {
    
        s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
    
        _w = (m13 - m31) / s;
        _x = (m12 + m21) / s;
        _y = 0.25 * s;
        _z = (m23 + m32) / s;
    
      } else {
    
        s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
    
        _w = (m21 - m12) / s;
        _x = (m13 + m31) / s;
        _y = (m23 + m32) / s;
        _z = 0.25 * s;
    
      }
    
      return {
        w: _w,
        x: _x,
        y: _y,
        z: _z
      };
    }
    
    function eulerSetFromQuaternion(q, order, update) {
    
      var matrix;
    
      matrix = makeRotationFromQuaternion(q);
    
      return eulerSetFromRotationMatrix(matrix, order);
    }
    
    function eulerSetFromRotationMatrix(m, order, update) {
    
      var _x, _y, _z;
      var clamp = function(value, min, max) {
        return Math.max(min, Math.min(max, value));
      };
    
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    
      var te = m;
      var m11 = te[0],
        m12 = te[4],
        m13 = te[8];
      var m21 = te[1],
        m22 = te[5],
        m23 = te[9];
      var m31 = te[2],
        m32 = te[6],
        m33 = te[10];
    
      //order = order || this._order;
      order = order || 'XYZ'; // KS added. Other code sets the rotation order default
    
      if (order === 'XYZ') {
    
        _y = Math.asin(clamp(m13, -1, 1));
    
        if (Math.abs(m13) < 0.99999) {
    
          _x = Math.atan2(-m23, m33);
          _z = Math.atan2(-m12, m11);
    
        } else {
    
          _x = Math.atan2(m32, m22);
          _z = 0;
    
        }
    
      } else if (order === 'YXZ') {
    
        _x = Math.asin(-clamp(m23, -1, 1));
    
        if (Math.abs(m23) < 0.99999) {
    
          _y = Math.atan2(m13, m33);
          _z = Math.atan2(m21, m22);
    
        } else {
    
          _y = Math.atan2(-m31, m11);
          _z = 0;
    
        }
    
      } else if (order === 'ZXY') {
    
        _x = Math.asin(clamp(m32, -1, 1));
    
        if (Math.abs(m32) < 0.99999) {
    
          _y = Math.atan2(-m31, m33);
          _z = Math.atan2(-m12, m22);
    
        } else {
    
          _y = 0;
          _z = Math.atan2(m21, m11);
    
        }
    
      } else if (order === 'ZYX') {
    
        _y = Math.asin(-clamp(m31, -1, 1));
    
        if (Math.abs(m31) < 0.99999) {
    
          _x = Math.atan2(m32, m33);
          _z = Math.atan2(m21, m11);
    
        } else {
    
          _x = 0;
          _z = Math.atan2(-m12, m22);
    
        }
    
      } else if (order === 'YZX') {
    
        _z = Math.asin(clamp(m21, -1, 1));
    
        if (Math.abs(m21) < 0.99999) {
    
          _x = Math.atan2(-m23, m22);
          _y = Math.atan2(-m31, m11);
    
        } else {
    
          _x = 0;
          _y = Math.atan2(m13, m33);
    
        }
    
      } else if (order === 'XZY') {
    
        _z = Math.asin(-clamp(m12, -1, 1));
    
        if (Math.abs(m12) < 0.99999) {
    
          _x = Math.atan2(m32, m22);
          _y = Math.atan2(m13, m11);
    
        } else {
    
          _x = Math.atan2(-m23, m33);
          _y = 0;
    
        }
    
      } else {
    
        console.warn('THREE.Euler: .setFromRotationMatrix() given unsupported order: ' + order);
    
      }
    
      //_order = order;
    
      //if ( update !== false ) this.onChangeCallback();
    
      return {
        x: _x,
        y: _y,
        z: _z
      };
    
    }
    
    function setFromQuaternion(q, order, update) {
    
      var matrix = makeRotationFromQuaternion(q);
    
      return setFromRotationMatrix(matrix, order, update);
    }
    
    function setFromRotationMatrix(m) {
    
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    
      var _w, _x, _y, _z;
      var te = m,
    
        m11 = te[0],
        m12 = te[4],
        m13 = te[8],
        m21 = te[1],
        m22 = te[5],
        m23 = te[9],
        m31 = te[2],
        m32 = te[6],
        m33 = te[10],
    
        trace = m11 + m22 + m33,
        s;
    
      if (trace > 0) {
    
        s = 0.5 / Math.sqrt(trace + 1.0);
    
        _w = 0.25 / s;
        _x = (m32 - m23) * s;
        _y = (m13 - m31) * s;
        _z = (m21 - m12) * s;
    
      } else if (m11 > m22 && m11 > m33) {
    
        s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
    
        _w = (m32 - m23) / s;
        _x = 0.25 * s;
        _y = (m12 + m21) / s;
        _z = (m13 + m31) / s;
    
      } else if (m22 > m33) {
    
        s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
    
        _w = (m13 - m31) / s;
        _x = (m12 + m21) / s;
        _y = 0.25 * s;
        _z = (m23 + m32) / s;
    
      } else {
    
        s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
    
        _w = (m21 - m12) / s;
        _x = (m13 + m31) / s;
        _y = (m23 + m32) / s;
        _z = 0.25 * s;
    
      }
    
      return {
        w: _w,
        x: _x,
        y: _y,
        z: _z
      };
    }
    
    function lookAt(eye, target, up) {
    
      // This routine does not support objects with rotated and/or translated parent(s)
    
      var m1 = lookAt2(target, eye, up);
    
      return setFromRotationMatrix(m1);
    
    }
    
    function lookAt2(eye, target, up) {
    
      var elements = new Float32Array([
    
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    
      ]);
    
    
      var x = {
        x: 0,
        y: 0,
        z: 0
      };
      var y = {
        x: 0,
        y: 0,
        z: 0
      };
      var z = {
        x: 0,
        y: 0,
        z: 0
      };
    
      var te = elements;
    
      z = subVectors(eye, target);
      z = normalize(z);
    
      if (lengthSq(z) === 0) {
    
        z.z = 1;
    
      }
    
      x = crossVectors(up, z);
      x = normalize(x);
    
      if (lengthSq(x) === 0) {
    
        z.z += 0.0001;
        x = crossVectors(up, z);
        x = normalize(x);
    
      }
    
      y = crossVectors(z, x);
    
    
      te[0] = x.x;
      te[4] = y.x;
      te[8] = z.x;
      te[1] = x.y;
      te[5] = y.y;
      te[9] = z.y;
      te[2] = x.z;
      te[6] = y.z;
      te[10] = z.z;
    
      return te;
    }
    
    
    function lookatOld(vecstart, vecEnd, vecUp) {
    
      var temp = new THREE.Matrix4();
      temp.lookAt(vecEnd, vecstart, vecUp);
    
      var m00 = temp.elements[0],
        m10 = temp.elements[1],
        m20 = temp.elements[2],
        m01 = temp.elements[4],
        m11 = temp.elements[5],
        m21 = temp.elements[6],
        m02 = temp.elements[8],
        m12 = temp.elements[9],
        m22 = temp.elements[10];
    
      var t = m00 + m11 + m22,
        s, x, y, z, w;
    
      if (t > 0) {
        s = Math.sqrt(t + 1) * 2;
        w = 0.25 * s;
        x = (m21 - m12) / s;
        y = (m02 - m20) / s;
        z = (m10 - m01) / s;
      } else if ((m00 > m11) && (m00 > m22)) {
        s = Math.sqrt(1.0 + m00 - m11 - m22) * 2;
        x = s * 0.25;
        y = (m10 + m01) / s;
        z = (m02 + m20) / s;
        w = (m21 - m12) / s;
      } else if (m11 > m22) {
        s = Math.sqrt(1.0 + m11 - m00 - m22) * 2;
        y = s * 0.25;
        x = (m10 + m01) / s;
        z = (m21 + m12) / s;
        w = (m02 - m20) / s;
      } else {
        s = Math.sqrt(1.0 + m22 - m00 - m11) * 2;
        z = s * 0.25;
        x = (m02 + m20) / s;
        y = (m21 + m12) / s;
        w = (m10 - m01) / s;
      }
    
      var rotation = new THREE.Quaternion(x, y, z, w);
      rotation.normalize();
      return rotation;
    }