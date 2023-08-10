"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas2");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var colorLocation = gl.getAttribLocation(program, "a_color");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  // Create a buffer to put colors in
  var colorBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // Put geometry data into buffer
  setColors(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var translation = [180, 150, 0];
  var rotation = [degToRad(40), degToRad(25), degToRad(325)];
  var scale = [1, 1, 1];

  var fieldOfViewRadians = degToRad(60);
  var rotationSpeed = 1.2;

  var then = 0;

  requestAnimationFrame(drawScene);

//   drawScene();


  // Setup a ui.

  // Draw the scene.
  function drawScene(now) {
    // Convert to seconds
    now *= 0.001;
    // // Subtract the previous time from the current time
    var deltaTime = now - then;
    // // Remember the current time for the next frame.
    then = now;

    // Every frame increase the rotation a little.
    rotation[1] += rotationSpeed * deltaTime;
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

    // Turn on the color attribute
    gl.enableVertexAttribArray(colorLocation);

    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 3;                 // 3 components per iteration
    var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(
      colorLocation, size, type, normalize, stride, offset);

    // Compute the matrices
    var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 25 * 6;
    gl.drawArrays(primitiveType, offset, count);

    // Call drawScene again next frame
    requestAnimationFrame(drawScene);
  }
}

var m4 = {

  projection: function (width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
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

  translation: function (tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },

  xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

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

// Fill the buffer with the values that define a letter 'A'.
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
  // left column front
  0, 0, 0,
  0, 150, 0,
  30, 0, 0,
  0, 150, 0,
  30, 150, 0,
  30, 0, 0,

  // right column front
  100, 0, 0,
  100, 150, 0,
  130, 0, 0,
  100, 150, 0,
  130, 150, 0,
  130, 0, 0,

  // top rung front
  30, 0, 0,
  30, 30, 0,
  100, 0, 0,
  30, 30, 0,
  100, 30, 0,
  100, 0, 0,

  // middle rung front
  30, 60, 0,
  30, 90, 0,
  100, 60, 0,
  30, 90, 0,
  100, 90, 0,
  100, 60, 0,

  // left column back
  0, 0, 30,
  30, 0, 30,
  0, 150, 30,
  0, 150, 30,
  30, 0, 30,
  30, 150, 30,

  // right column back
  100, 0, 30,
  130, 0, 30,
  100, 150, 30,
  100, 150, 30,
  130, 0, 30,
  130, 150, 30,

  // top rung back
  30, 0, 30,
  100, 0, 30,
  30, 30, 30,
  30, 30, 30,
  100, 0, 30,
  100, 30, 30,

  // middle rung back
  30, 60, 30,
  100, 60, 30,
  30, 90, 30,
  30, 90, 30,
  100, 60, 30,
  100, 90, 30,

  // top
  0, 0, 0,
  130, 0, 30,
  0, 0, 30,
  0, 0, 0,
  130, 0, 0,
  130, 0, 30,

  // right side
  130, 0, 0,
  130, 150, 30,
  130, 0, 30,
  130, 0, 0,
  130, 150, 0,
  130, 150, 30,

  // under top rung
  30, 30, 0,
  30, 30, 30,
  100, 30, 30,
  30, 30, 0,
  100, 30, 30,
  100, 30, 0,

  //between top rung and middle 2
  100, 30, 0,
  100, 30, 30,
  100, 60, 30,
  100, 30, 0,
  100, 60, 30,
  100, 60, 0,

  // between top rung and middle
  30, 30, 0,
  30, 60, 30,
  30, 30, 30,
  30, 30, 0,
  30, 60, 0,
  30, 60, 30,

  // top of middle rung
  30, 60, 0,
  100, 60, 30,
  30, 60, 30,
  30, 60, 0,
  100, 60, 0,
  100, 60, 30,


  // bottom of middle rung.
  30, 90, 0,
  30, 90, 30,
  100, 90, 30,
  30, 90, 0,
  100, 90, 30,
  100, 90, 0,

  // left of bottom
  100, 90, 0,
  100, 90, 30,
  100, 150, 30,
  100, 90, 0,
  100, 150, 30,
  100, 150, 0,

  // right of bottom
  30, 90, 0,
  30, 150, 30,
  30, 90, 30,
  30, 90, 0,
  30, 150, 0,
  30, 150, 30,

  // bottom
  0, 150, 0,
  0, 150, 30,
  30, 150, 30,
  0, 150, 0,
  30, 150, 30,
  30, 150, 0,

  //bottom 2
  100, 150, 0,
  100, 150, 30,
  130, 150, 30,
  100, 150, 0,
  130, 150, 30,
  130, 150, 0,

  // left side
  0, 0, 0,
  0, 0, 30,
  0, 150, 30,
  0, 0, 0,
  0, 150, 30,
  0, 150, 0,

 
]),
gl.STATIC_DRAW);
}

// Fill the buffer with colors for the 'A'.
function setColors(gl) {
gl.bufferData(
gl.ARRAY_BUFFER,
new Uint8Array([
  // left column front
  200, 70, 120, // merah
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,

  // right column front
  200, 70, 120, // merah
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,

  // top rung front
  200, 70, 120, // merah
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,

  // middle rung front
  200, 70, 120, // merah
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,
  200, 70, 120,

  // left column back
  80, 70, 200, // ungu tua
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,

  // right column back
  80, 70, 200, // ungu tua
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,

  // top rung back
  80, 70, 200, // ungu tua
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,

  // middle rung back
  80, 70, 200, // ungu tua
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,
  80, 70, 200,

  // top
  70, 200, 210, // biru lebih muda
  70, 200, 210,
  70, 200, 210,
  70, 200, 210,
  70, 200, 210,
  70, 200, 210,

  // right side
  200, 200, 70, // kuning
  200, 200, 70,
  200, 200, 70,
  200, 200, 70,
  200, 200, 70,
  200, 200, 70,

  // under top rung
  210, 100, 70, // orange
  210, 100, 70,
  210, 100, 70,
  210, 100, 70,
  210, 100, 70,
  210, 100, 70,

  // between top rung and middle 2
  210, 160, 70, // jingga
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,

  // between top rung and middle
  210, 160, 70, // jingga
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,

  // top of middle rung
  70, 180, 210, // biru muda
  70, 180, 210,
  70, 180, 210,
  70, 180, 210,
  70, 180, 210,
  70, 180, 210,


  // bottom of middle rung.
  76, 210, 100, // hijau
  76, 210, 100, 
  76, 210, 100,
  76, 210, 100,
  76, 210, 100,
  76, 210, 100,

  // left of bottom2
  140, 210, 80, // hijau muda
  140, 210, 80,
  140, 210, 80,
  140, 210, 80,
  140, 210, 80,
  140, 210, 80,

  // right of bottom
  140, 210, 80, // hiju muda
  140, 210, 80,
  140, 210, 80,
  140, 210, 80,
  140, 210, 80,
  140, 210, 80,

  // bottom
  90, 130, 110, // hijau tua
  90, 130, 110,
  90, 130, 110,
  90, 130, 110,
  90, 130, 110,
  90, 130, 110,

  //bottom 2
  90, 130, 110, // hijau tua
  90, 130, 110,
  90, 130, 110,
  90, 130, 110,
  90, 130, 110,
  90, 130, 110,


  // left side
  210, 160, 70, // jingga
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70, 

    ]),
    gl.STATIC_DRAW);
}


main();