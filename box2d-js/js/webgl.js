// ----------------------------------------------------------------------------
function reportError(msg)
{
  let div = document.getElementById('canvas');
  div.innerHTML = "<p>" + msg + "</p>";
  div.className = "alert";
}

// ----------------------------------------------------------------------------
function loadShader(gl, type, source)
{
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    reportError('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// ----------------------------------------------------------------------------
function initShaderProgram(gl, vsSource, fsSource)
{
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    reportError('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// ----------------------------------------------------------------------------
function initShapeBuffers(gl)
{
  const positions = [
    -0.5,  0.5,
     0.5,  0.5,
     0.5, -0.5,
    -0.5, -0.5,
  ];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer
  };
}

// ----------------------------------------------------------------------------
function drawScene(programInfo, bodies)
{
  const gl = programInfo.gl;
  const buffers = programInfo.buffers;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const zoom = 10.0;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const left = -zoom * aspect;
  const right = zoom * aspect;
  const top = zoom;
  const bottom = -zoom;

  const projectionMatrix = glMatrix.mat4.create();
  glMatrix.mat4.ortho(projectionMatrix, left, right, bottom, top, -1.0, 1.0);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertex,
      2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertex);

  gl.useProgram(programInfo.program);

  const bodyMatrix = glMatrix.mat4.create();
  bodies.forEach(function(body) {
    glMatrix.mat4.fromTranslation(bodyMatrix, [body.position.u0, body.position.u1, 0.0]);
    glMatrix.mat4.rotateZ(bodyMatrix, bodyMatrix, body.rotation);
    glMatrix.mat4.scale(bodyMatrix, bodyMatrix, [body.width.u0, body.width.u1, 1.0]);
    glMatrix.mat4.mul(bodyMatrix, projectionMatrix, bodyMatrix);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.matrix,
        false,
        bodyMatrix);
    gl.drawArrays(gl.LINE_LOOP, 0, 4);
  });

}

// ----------------------------------------------------------------------------
function initGl()
{
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");

  if (gl === null) {
    reportError("Your browser does not support WebGL.");
    return;
  }

  const vsSource = `
    attribute vec4 aVertex;

    uniform mat4 uMatrix;

    void main() {
      gl_Position = uMatrix * aVertex;
    }
  `;

  const fsSource = `
    void main(void) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shapeBuffers = initShapeBuffers(gl);

  const programInfo = {
    gl: gl,
    program: shaderProgram,
    buffers: shapeBuffers,
    attribLocations: {
      vertex: gl.getAttribLocation(shaderProgram, 'aVertex'),
    },
    uniformLocations: {
      matrix: gl.getUniformLocation(shaderProgram, 'uMatrix'),
    },
  };

  return programInfo;
}
