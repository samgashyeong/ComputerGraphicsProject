"use strict";


var gl;


var rotationThetaX = 0;
var rotationThetaY = 0;
var rotationThetaZ = 0;

var positionX = 0.0;
var positionY = 0.0;
var positionZ = 0.0;

var scaleX = 1.0;
var scaleY = 1.0;
var scaleZ = 1.0;

var canvasW = 800;
var canvasH = 800;
var mvMatrix;
var ptMatrix;
var modelViewLoc;
var projectionLoc;
var colorLoc; // 전역 변수로 선언

// 큐브 정점 및 인덱스 정의
const cubeIndices = [
    1, 0, 3, 1, 3, 2,
    2, 3, 7, 2, 7, 6,
    3, 0, 4, 3, 4, 7,
    6, 5, 1, 6, 1, 2,
    4, 5, 6, 4, 6, 7,
    5, 4, 0, 5, 0, 1
];

let cubePoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    cubePoints.push(cubeVertices[cubeIndices[i]]);
}

let tallCubePoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    tallCubePoints.push(tallCubeVertices[cubeIndices[i]]);
}

let wideCubePoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    wideCubePoints.push(wideCubeVertices[cubeIndices[i]]);
}

let horseThighPoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    horseThighPoints.push(horseThighVertices[cubeIndices[i]]);
}
let horseCalfPoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    horseCalfPoints.push(horseCalfVertices[cubeIndices[i]]);
}

let horseHoofPoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    horseHoofPoints.push(horseHoofVertices[cubeIndices[i]]);
}

let trapezoidPoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    trapezoidPoints.push(trapezoidVertices[cubeIndices[i]]);
}

let horseFrontThighPoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    horseFrontThighPoints.push(horseFrontThighVertices[cubeIndices[i]]);
}
let horseManePoints = [];
for (let i = 0; i < cubeIndices.length; ++i) {
    horseManePoints.push(horseManeVertices[cubeIndices[i]]);
}
// 카메라 위치 배열
var bufferCube;
var bufferTallCube;
var bufferWideCube;
var bufferHorseThighVertices;
var bufferHorseCalfVertices;
var bufferHorseHoofVertices;
var bufferTrapezoidVertices;
var bufferHorseFrontThighVertices;
var bufferHorseManeVertices
const cameraPositions = [
    vec3(3, 2, 4),   // 기존 대각선
    vec3(0, 5, 8),   // 기존 정면 위
    vec3(-5, 1, 5),  // 기존 왼쪽 위  // Camera 3: 왼쪽 위에서 전체를 내려다봄
];
let eyeSlider = {
    x: 3,
    y: 2,
    z: 4
};
let currentCamera = 0; // 기본 카메라 인덱스
var vPosition;



var stack = [];
var modelViewMatrix
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    spawnHorses(3);
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1., 1., 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    modelViewLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix");
    colorLoc = gl.getUniformLocation(program, "uColor");

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);

    bufferCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCube);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);

    bufferTallCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTallCube);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tallCubePoints), gl.STATIC_DRAW);

    bufferWideCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferWideCube);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wideCubePoints), gl.STATIC_DRAW);

    bufferHorseThighVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferHorseThighVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(horseThighPoints), gl.STATIC_DRAW);

    bufferHorseCalfVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferHorseCalfVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(horseCalfPoints), gl.STATIC_DRAW);

    bufferHorseHoofVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferHorseHoofVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(horseHoofPoints), gl.STATIC_DRAW);

    bufferTrapezoidVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTrapezoidVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trapezoidPoints), gl.STATIC_DRAW)

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    bufferHorseFrontThighVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferHorseFrontThighVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(horseFrontThighPoints), gl.STATIC_DRAW);


    bufferHorseManeVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferHorseManeVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(horseManePoints), gl.STATIC_DRAW);
    // 라디오 버튼 이벤트 등록
    ["cam1", "cam2", "cam3"].forEach((id, idx) => {
        document.getElementById(id).addEventListener("change", function () {
            if (this.checked) {
                currentCamera = idx;
            }
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
        spawnHorses(count);
    };

    render();
};

let horses = []; // 말 인스턴스 배열
let horsesSpeed = [];
let horsesCurSpeed = [];

let pz = 0;
function randomPosition(existingPositions = [], minDist = 0.3, range = 6) {
    let maxTry = 100;
    while (maxTry-- > 0) {
        let x = 0; // x만 랜덤
        let y = 0;
        let z = Math.random() * range * 2 - range;
        let tooClose = existingPositions.some(pos => {
            let dz = pos[2] - z;
            return Math.abs(dz) < minDist;
        });
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
            1.5 + Math.random(),
            2.2 + Math.random(),
            1.0 + Math.random(),
            2.8 + Math.random()
        ],
        runningSpeed: [
            1.2 + Math.random(),
        ],
    };
}

function spawnHorses(count) {
    horses = [];
    let positions = [];
    for (let i = 0; i < count; i++) {
        let horse = createHorseInstance(positions);
        let horseS = Math.random() / 10;
        positions.push(horse.position);
        horses.push(horse);
        horsesSpeed.push(horseS);
        horsesCurSpeed.push(0);
    }
}

function drawCube(matrix, color, buffer, vertexCount) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(matrix));
    gl.uniform4fv(colorLoc, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

var figure = [];
function settingNode(legAngles, horsePosition, horsesCurSpeed) {
    for (var i = 0; i < 100; i++)
        figure[i] = createNode(null, null, null, null);

    let eye = vec3(eyeSlider.x, eyeSlider.y, eyeSlider.z);
    var mV = mult(
        lookAt(eye, vec3(0, 0, 0), vec3(0, 1, 0)),
        mult(rotate(angle, [0, 1, 0]), scalem(1, 1, 1))
    );
    figure[0] = createNode(
        mult(mult(mV, translate(horsePosition[0]-horsesCurSpeed + 10, horsePosition[1], horsePosition[2])), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 0.0, 0.0, 1.0), bufferWideCube, cubePoints.length); },
        null,
        1,
    );

    //다리1
    figure[1] = createNode(
        mult(translate(0.25, -0.15, -0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferHorseThighVertices, horseThighPoints.length); },
        5,
        2
    );

    figure[2] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferTallCube, tallCubePoints.length); },
        null,
        3
    );

    figure[3] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), bufferHorseCalfVertices, horseCalfPoints.length); },
        null,
        4
    );


    figure[4] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseHoofVertices, tallCubePoints.length); },
        null,
        null
    );

    //다리 2
    figure[5] = createNode(
        mult(translate(0.25, -0.15, 0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferHorseThighVertices, horseThighPoints.length); },
        9,
        6
    );
    figure[6] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferTallCube, tallCubePoints.length); },
        null,
        7
    );

    figure[7] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), bufferHorseCalfVertices, horseCalfPoints.length); },
        null,
        8
    );
    figure[8] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseHoofVertices, tallCubePoints.length); },
        null,
        null
    );

    //꼬리
    figure[9] = createNode(
        mult(translate(0.35, 0, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseCalfVertices, tallCubePoints.length); },
        11,
        10
    );
    figure[10] = createNode(
        mult(translate(0, -0.15, 0), rotate(legAngles[3], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseCalfVertices, tallCubePoints.length); },
        null,
        null
    );


    //머리
    figure[11] = createNode(
        mult(translate(-0.35, 0.15, 0), rotate(0.4 * legAngles[1] + 240, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferTrapezoidVertices, tallCubePoints.length); },
        15,
        12
    );

    figure[12] = createNode(
        mult(translate(0, -0.2, 0), rotate(0, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferTrapezoidVertices, tallCubePoints.length); },
        null,
        13
    );

    figure[13] = createNode(
        mult(translate(0.1, -0.17, 0), rotate(60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferTrapezoidVertices, tallCubePoints.length); },
        23,
        14
    );

    figure[14] = createNode(
        mult(translate(0.05, -0.09, -0), rotate(60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferTrapezoidVertices, tallCubePoints.length); },
        null,
        null
    );

    //다리3
    figure[15] = createNode(
        mult(translate(-0.20, -0.15, -0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseFrontThighVertices, tallCubePoints.length); },
        19,
        16
    );
    figure[16] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferTallCube, tallCubePoints.length); },
        null,
        17
    );

    figure[17] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), bufferHorseCalfVertices, horseCalfPoints.length); },
        null,
        18
    );
    figure[18] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseHoofVertices, tallCubePoints.length); },
        null,
        null
    );

    //다리4
    figure[19] = createNode(
        mult(translate(-0.20, -0.15, 0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseFrontThighVertices, tallCubePoints.length); },
        null,
        20
    );
    figure[20] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferTallCube, tallCubePoints.length); },
        null,
        21
    );

    figure[21] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 1.0, 1.0), bufferHorseCalfVertices, horseCalfPoints.length); },
        null,
        22
    );
    figure[22] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(1.0, 1.0, 0.0, 1.0), bufferHorseHoofVertices, tallCubePoints.length); },
        null,
        null
    );


    //귀 양쪽
    figure[23] = createNode(
        mult(translate(-0.02, -0.3, 0.1), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferHorseFrontThighVertices, tallCubePoints.length); },
        24,
        null
    );

    figure[24] = createNode(
        mult(translate(-0.02, -0.3, -0.1), rotate(legAngles[2], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 1.0, 0.0, 1.0), bufferHorseFrontThighVertices, tallCubePoints.length); },
        25,
        null
    );

    //갈귀귀
    figure[25] = createNode(
        mult(translate(-0.02, -0.3, -0.0), rotate(0, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        26,
        null
    );
    figure[26] = createNode(
        mult(translate(-0.1, -0.05, -0.0), rotate(legAngles[1]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        27,
        null
    );
    figure[27] = createNode(
        mult(translate(-0.1, -0.1, -0.0), rotate(legAngles[2]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        28,
        null
    );
    figure[28] = createNode(
        mult(translate(-0.1, 0, -0.0), rotate(legAngles[3]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        29,
        null
    );
    figure[29] = createNode(
        mult(translate(-0.1, 0.05, -0.0), rotate(legAngles[0]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        30,
        null
    );
    figure[30] = createNode(
        mult(translate(-0.1, +0.1, -0.0), rotate(legAngles[1]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        31,
        null
    );
    figure[31] = createNode(
        mult(translate(-0.07, -0.2, -0.0), rotate(legAngles[0]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        32,
        null
    );
    figure[32] = createNode(
        mult(translate(-0.05, -0.25, -0.0), rotate(legAngles[2]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        33,
        null
    );
    figure[33] = createNode(
        mult(translate(-0.1, +0.15, -0.0), rotate(legAngles[2]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        34,
        null
    );
    figure[34] = createNode(
        mult(translate(-0.1, +0.2, -0.0), rotate(legAngles[3]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        35,
        null
    );
    figure[35] = createNode(
        mult(translate(-0.1, +0.25, -0.0), rotate(legAngles[0]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        36,
        null
    );
    figure[36] = createNode(
        mult(translate(-0.1, +0.3, -0.0), rotate(legAngles[2]+60, [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.0, 0.0, 0.0, 1.0), bufferHorseManeVertices, tallCubePoints.length); },
        null,
        null
    );
}

// 하이어라키 구조로 큐브 여러 개 그리기 예시
let angle = 60; // 회전 각도(도)
let legAngles = [0, 0, 0, 0]; // 각 다리의 각도
let legDirections = [1, 1, 1, 1]; // 각 다리의 회전 방향
let legSpeeds = [1.5, 2.2, 1.0, 2.8];
let speedOfHorse = 0;
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let h = 0; h < horses.length; h++) {
        let horse = horses[h];

        // 각 말의 다리 애니메이션
        for (let i = 0; i < 4; i++) {
            horse.legAngles[i] += horse.legDirections[i] * horse.legSpeeds[i];
            if (horse.legAngles[i] > 30) horse.legDirections[i] = -1;
            if (horse.legAngles[i] < -30) horse.legDirections[i] = 1;
        }

        modelViewMatrix = mat4();

        console.log(horsesSpeed[h]);

        horsesCurSpeed[h] += horsesSpeed[h];
        if (horsesCurSpeed[h] > 10) horsesCurSpeed[h] = 0;
        // 각 말의 settingNode/figure 구조를 horse.legAngles로 세팅
        // (여기서는 기존 settingNode를 horse.legAngles로 동작하도록 수정 필요)

        settingNode(horse.legAngles, horse.position, horsesCurSpeed[h]);
        traverse(0);
    }

    ptMatrix = perspective(45, canvasW / canvasH, 0.1, 1000.0);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(ptMatrix));

    window.requestAnimFrame(render);
}



function traverse(Id) {
    if (Id == null)
        return;
    stack.push(modelViewMatrix); //save the graphics state with stack.push
    modelViewMatrix =
        mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render(); // draw the objects at the node with the function
    //traverse all the children recursively
    if (figure[Id].child != null)
        traverse(figure[Id].child);
    modelViewMatrix = stack.pop(); //return to the original state with stack.pop
    if (figure[Id].sibling != null)
        traverse(figure[Id].sibling);
}

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform, //modelViewMatrix 
        render: render, //render function
        sibling: sibling, // 형제
        child: child, //자식
    }
    return node;
}