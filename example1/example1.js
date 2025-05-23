"use strict";

var gl, program;
var canvasW = 800, canvasH = 800;
var modelViewLoc, projectionLoc, colorLoc;
var vPosition, vTexCoord;
var modelViewMatrix, ptMatrix;
var stack = [];
let angle = 60;


var horseCount = 30;
const cameraPositions = [
    vec3(3, 2, 4),
    vec3(0, 5, 8),
    vec3(-5, 1, 5),
];
const cubeIndices = [
    1, 0, 3, 1, 3, 2, // 앞면
    2, 3, 7, 2, 7, 6, // 오른쪽면
    3, 0, 4, 3, 4, 7, // 아래면
    6, 5, 1, 6, 1, 2, // 윗면
    4, 5, 6, 4, 6, 7, // 뒷면
    5, 4, 0, 5, 0, 1  // 왼쪽면
];

let eyeSlider = { x: 3, y: 2, z: 4 };
let currentCamera = 0;

let horses = [], horsesSpeed = [], horsesCurSpeed = [];
let figure = [], horseType = [];

function createBufferWithData(data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
    return buffer;
}

function createTextureWithImage(src) {
    const texture = gl.createTexture();
    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = src;
    return texture;
}

function setupAttribute(buffer, attribLoc, size) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribLoc, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLoc);
}

// --- Points 생성 (model.js에서 vertices와 cubeIndices를 이용) ---
function makePoints(vertices) {
    let points = [];
    for (let i = 0; i < cubeIndices.length; ++i) {
        points.push(vertices[cubeIndices[i]]);
    }
    return points;
}

// --- Buffer & Texture Setup ---
let buffers = {}, textures = {}, texBuffers = {}, texAttribs = {};

// 각 부위별 points
const cubePoints = makePoints(cubeVertices);
const tallCubePoints = makePoints(tallCubeVertices);
const wideCubePoints = makePoints(wideCubeVertices);
const horseThighPoints = makePoints(horseThighVertices);
const horseFrontThighPoints = makePoints(horseFrontThighVertices);
const horseCalfPoints = makePoints(horseCalfVertices);
const horseHoofPoints = makePoints(horseHoofVertices);
const trapezoidPoints = makePoints(trapezoidVertices);
const horseManePoints = makePoints(horseManeVertices);


function setupBuffersAndTextures() {
    // Points
    buffers.cube = createBufferWithData(cubePoints);
    buffers.tallCube = createBufferWithData(tallCubePoints);
    buffers.wideCube = createBufferWithData(wideCubePoints);
    buffers.horseThigh = createBufferWithData(horseThighPoints);
    buffers.horseCalf = createBufferWithData(horseCalfPoints);
    buffers.horseHoof = createBufferWithData(horseHoofPoints);
    buffers.trapezoid = createBufferWithData(trapezoidPoints);
    buffers.horseFrontThigh = createBufferWithData(horseFrontThighPoints);
    buffers.horseMane = createBufferWithData(horseManePoints);

    // Texture Buffers (모두 동일 구조라면 하나만 써도 됨)
    texBuffers.brown = createBufferWithData(cubeTexCoords);
    texBuffers.black = createBufferWithData(cubeTexCoords);
    texBuffers.white = createBufferWithData(cubeTexCoords);
    texBuffers.yellow = createBufferWithData(cubeTexCoords);

    // Texture Objects
    textures.brown = createTextureWithImage("texture/brown_1.png");
    textures.black = createTextureWithImage("texture/black_1.png");
    textures.white = createTextureWithImage("texture/white_1.png");
    textures.yellow = createTextureWithImage("texture/yellow_1.png");
}

// --- Utility ---
function randomPosition(existingPositions = [], minDist = 0.3, range = 6) {
    let maxTry = 100;
    while (maxTry-- > 0) {
        let x = 0, y = 0, z = Math.random() * range * 2 - range;
        let tooClose = existingPositions.some(pos => Math.abs(pos[2] - z) < minDist);
        if (!tooClose) return [x, y, z];
    }
    return [Math.random() * range * 2 - range, 0, 0];
}

function createHorseInstance(existingPositions) {
    return {
        position: randomPosition(existingPositions),
        legAngles: [0, 0, 0, 0],
        legDirections: [1, 1, 1, 1],
        legSpeeds: [
            1.5 + Math.random() * 1.2,
            2.2 + Math.random() * 1.2,
            1.0 + Math.random() * 1.2,
            2.8 + Math.random() * 1.2,
        ],
        runningSpeed: [1.2 + Math.random()],
    };
}

function spawnHorses(count) {
    horses = [];
    horsesSpeed = [];
    horsesCurSpeed = [];
    let positions = [];
    for (let i = 0; i < count; i++) {
        let horse = createHorseInstance(positions);
        let horseS = Math.random() / 10;
        positions.push(horse.position);
        horses.push(horse);
        horsesSpeed.push(horseS);
        horsesCurSpeed.push(0);
        let type = Math.floor(Math.random() * 3);
        horseType.push(type);
    }
}

// --- Drawing ---
function drawCube(matrix, color, buffer, vertexCount, texBuffer = texBuffers.black, texture = textures.black) {
    setupAttribute(buffer, vPosition, 4);
    setupAttribute(texBuffer, vTexCoord, 2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(matrix));
    gl.uniform4fv(colorLoc, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

// --- Node/Hierarchy ---
function createNode(transform, render, sibling, child) {
    return { transform, render, sibling, child };
}

function traverse(Id) {
    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function settingNode(legAngles, horsePosition, horsesCurSpeed, horseType) {
    for (let i = 0; i < 100; i++) figure[i] = createNode(null, null, null, null);

    let eye = vec3(eyeSlider.x, eyeSlider.y, eyeSlider.z);
    let mV = mult(
        lookAt(eye, vec3(0, 0, 0), vec3(0, 1, 0)),
        mult(rotate(angle, [0, 1, 0]), scalem(1, 1, 1))
    );

    let texBuffer, texture;
    if (horseType === 0) {
        texBuffer = texBuffers.black;
        texture = textures.black;
    } else if (horseType === 1) {
        texBuffer = texBuffers.brown;
        texture = textures.brown;
    } else {
        texBuffer = texBuffers.white;
        texture = textures.white;
    }

    // 몸통
    figure[0] = createNode(
        mult(mult(mV, translate(horsePosition[0] - horsesCurSpeed + 10, horsePosition[1], horsePosition[2])), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1, 0, 0, 1), buffers.wideCube, wideCubePoints.length, texBuffer, texture),
        null, 1
    );

    // 다리1
    figure[1] = createNode(
        mult(translate(0.25, -0.15, -0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseThigh, horseThighPoints.length, texBuffer, texture),
        5, 2
    );
    figure[2] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffer, texture),
        null, 3
    );
    figure[3] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffer, texture),
        null, 4
    );
    figure[4] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, texBuffers.black, textures.black),
        null, null
    );

    // 다리2
    figure[5] = createNode(
        mult(translate(0.25, -0.15, 0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseThigh, horseThighPoints.length, texBuffers.black, textures.black),
        9, 6
    );
    figure[6] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffers.black, textures.black),
        null, 7
    );
    figure[7] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffers.black, textures.black),
        null, 8
    );
    figure[8] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, texBuffers.black, textures.black),
        null, null
    );

    // 꼬리
    figure[9] = createNode(
        mult(translate(0.35, 0, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffers.black, textures.black),
        11, 10
    );
    figure[10] = createNode(
        mult(translate(0, -0.15, 0), rotate(legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffers.black, textures.black),
        null, null
    );

    // 머리
    figure[11] = createNode(
        mult(translate(-0.35, 0.15, 0), rotate(0.4 * legAngles[1] + 240, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffers.black, textures.black),
        15, 12
    );
    figure[12] = createNode(
        mult(translate(0, -0.2, 0), rotate(0, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffers.black, textures.black),
        null, 13
    );
    figure[13] = createNode(
        mult(translate(0.1, -0.17, 0), rotate(60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffers.black, textures.black),
        23, 14
    );
    figure[14] = createNode(
        mult(translate(0.05, -0.09, -0), rotate(60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffers.black, textures.black),
        null, null
    );

    // 다리3
    figure[15] = createNode(
        mult(translate(-0.20, -0.15, -0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, texBuffers.black, textures.black),
        19, 16
    );
    figure[16] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffers.black, textures.black),
        null, 17
    );
    figure[17] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffers.black, textures.black),
        null, 18
    );
    figure[18] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, texBuffers.black, textures.black),
        null, null
    );

    // 다리4
    figure[19] = createNode(
        mult(translate(-0.20, -0.15, 0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, texBuffers.black, textures.black),
        null, 20
    );
    figure[20] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffers.black, textures.black),
        null, 21
    );
    figure[21] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffers.black, textures.black),
        null, 22
    );
    figure[22] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, texBuffers.black, textures.black),
        null, null
    );

    // 귀 양쪽
    figure[23] = createNode(
        mult(translate(-0.02, -0.3, 0.1), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, texBuffers.black, textures.black),
        24, null
    );
    figure[24] = createNode(
        mult(translate(-0.02, -0.3, -0.1), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, texBuffers.black, textures.black),
        25, null
    );

    // 갈귀
    figure[25] = createNode(
        mult(translate(-0.02, -0.3, -0.0), rotate(legAngles[1] + 60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, texBuffers.white, textures.white),
        26,
        null
    );

    figure[26] = createNode(
        mult(translate(-0.1, -0.05, -0.0), rotate(legAngles[2] + 60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, texBuffers.white, textures.white),
        27,
        null
    );


    figure[27] = createNode(
        mult(translate(-0.1, -0.1, -0.0), rotate(legAngles[3] + 60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, texBuffers.white, textures.white),
        28,
        null
    );

    for (let i = 28; i <= 36; i++) {
        let y = -0.3 + 0.05 * (i - 25);
        figure[i] = createNode(
            mult(translate(-0.1, y, 0), rotate(legAngles[(i - 25) % 4] + 60, [0, 0, 1])),
            () => drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, texBuffers.yellow, textures.yellow),
            i < 36 ? i + 1 : null,
            null
        );
    }
}

// --- Animation ---
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (horseCount > 1) {
        for (let h = 0; h < horses.length; h++) {
            let horse = horses[h];
            for (let i = 0; i < 4; i++) {
                horse.legAngles[i] += horse.legDirections[i] * horse.legSpeeds[i];
                if (horse.legAngles[i] > 30) horse.legDirections[i] = -1;
                if (horse.legAngles[i] < -30) horse.legDirections[i] = 1;
            }
            modelViewMatrix = mat4();
            horsesCurSpeed[h] += horsesSpeed[h];
            if (horsesCurSpeed[h] > 30) horsesCurSpeed[h] = 0;
            settingNode(horse.legAngles, horse.position, horsesCurSpeed[h], horseType[h]);
            traverse(0);
        }
    }
    else {
        let horse = horses[0];
        for (let i = 0; i < 4; i++) {
                horse.legAngles[i] += horse.legDirections[i] * horse.legSpeeds[i];
                if (horse.legAngles[i] > 30) horse.legDirections[i] = -1;
                if (horse.legAngles[i] < -30) horse.legDirections[i] = 1;
        }
        modelViewMatrix = mat4();
        horsesCurSpeed[0] = 0;
        settingNode(horse.legAngles, horse.position, horsesCurSpeed[0], horseType[0]);
        traverse(0);
    }

    ptMatrix = perspective(45, canvasW / canvasH, 0.1, 1000.0);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(ptMatrix));
    window.requestAnimFrame(render);
}

// --- UI ---
function setupUI() {
    ["cam1", "cam2", "cam3"].forEach((id, idx) => {
        document.getElementById(id).addEventListener("change", function () {
            if (this.checked) currentCamera = idx;
        });
    });
    ["eyeX", "eyeY", "eyeZ"].forEach((id, idx) => {
        let slider = document.getElementById(id);
        let valSpan = document.getElementById(id + "Val");
        slider.oninput = function () {
            eyeSlider[["x", "y", "z"][idx]] = parseFloat(this.value);
            valSpan.textContent = this.value;
        };
    });
    document.getElementById("spawnBtn").onclick = function () {
        const count = parseInt(document.getElementById("horseCount").value);
        horseCount = count;
        spawnHorses(count);
    };

    document.getElementById("singleHorseToggle").addEventListener("change", function () {
        if (this.checked) {
            horseCount = 1;
            spawnHorses(1);
        } else {
            const count = parseInt(document.getElementById("horseCount").value);
            horseCount = count;
            spawnHorses(count);
        }
    });

}

// --- Main ---
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1., 1., 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    modelViewLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix");
    colorLoc = gl.getUniformLocation(program, "uColor");
    vPosition = gl.getAttribLocation(program, "vPosition");
    vTexCoord = gl.getAttribLocation(program, "vTexCoord");

    setupBuffersAndTextures();
    setupUI();
    spawnHorses(horseCount);
    render();
};