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
// 카메라 위치 배열
var bufferCube;
var bufferTallCube;
var bufferWideCube;
var bufferHorseThighVertices;
var bufferHorseCalfVertices;
var bufferHorseHoofVertices;

const cameraPositions = [
    vec3(0, 0, -4),   // Camera 1: 오른쪽 위에서 전체를 내려다봄
    vec3(0, 4, 8),   // Camera 2: 정면 위에서 전체를 내려다봄
    vec3(-5, 0, 5)   // Camera 3: 왼쪽 위에서 전체를 내려다봄
];
let currentCamera = 0; // 기본 카메라 인덱스
var vPosition;



var stack = [];
var modelViewMatrix
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

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
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // 라디오 버튼 이벤트 등록
    ["cam1", "cam2", "cam3"].forEach((id, idx) => {
        document.getElementById(id).addEventListener("change", function () {
            if (this.checked) {
                currentCamera = idx;
            }
        });
    });

    render();
};


function drawCube(matrix, color, buffer, vertexCount) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(matrix));
    gl.uniform4fv(colorLoc, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

var figure = [];
function settingNode() {
    for (var i = 0; i < 20; i++)
        figure[i] = createNode(null, null, null, null);

    let eye = cameraPositions[currentCamera];
    var mV = mult(
        lookAt(eye, vec3(0, 0, 0), vec3(0, 1, 0)),
        mult(rotate(angle, [0, 1, 0]), scalem(1, 1, 1))
    );
    figure[0] = createNode(
        mult(mV, translate(0.0, 0.0, 0.0)),
        function () { drawCube(modelViewMatrix, vec4(0.35, 0.22, 0.1, 1.0), bufferWideCube, cubePoints.length); },
        null,
        1,
    );
    figure[1] = createNode(
        mult(translate(0.25, -0.15, -0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.5, 0.3, 0.2, 1.0), bufferHorseThighVertices, horseThighPoints.length); },
        5,
        2
    );

    // // 다리1
    figure[2] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.65, 0.4, 0.25, 1.0), bufferTallCube, tallCubePoints.length); },
        null,
        3
    );

    figure[3] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.7, 0.45, 0.3, 1.0), bufferHorseCalfVertices, horseCalfPoints.length); },
        null,
        4
    );


    // // 다리2

    // 다리3
    figure[4] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2],[0, 0, 1])),
        function() { drawCube(modelViewMatrix, vec4(0.2, 0.2, 0.2, 1.0), bufferHorseHoofVertices, tallCubePoints.length); },
        null,
        null,
    );

    figure[5] = createNode(
        mult(translate(0.25, -0.15, 0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.5, 0.3, 0.2, 1.0), bufferHorseThighVertices, horseThighPoints.length); },
        9,
        6
    );
    // // 다리1
    figure[6] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.65, 0.4, 0.25, 1.0), bufferTallCube, tallCubePoints.length); },
        null,
        7
    );

    figure[7] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        function () { drawCube(modelViewMatrix, vec4(0.7, 0.45 ,0.3, 1.0), bufferHorseCalfVertices, horseCalfPoints.length); },
        null,
        8
    );


    // // 다리2

    // 다리3
    figure[8] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0],[0, 0, 1])),
        function() { drawCube(modelViewMatrix, vec4(0.2, 0.2, 0.2, 1.0), bufferHorseHoofVertices, tallCubePoints.length); },
        null,
        null
    );
    
    figure[9] = createNode(
        mult(translate(0.35, 0, 0), rotate(legAngles[1],[0, 0, 1])),
        function() { drawCube(modelViewMatrix, vec4(0.7, 0.45, 0.3, 1.0), bufferHorseCalfVertices, tallCubePoints.length); },
        null,
        10
    );

    figure[10] = createNode(
        mult(translate(0, -0.15, 0), rotate( legAngles[3],[0, 0, 1])),
        function() { drawCube(modelViewMatrix, vec4(0.7, 0.4, 0.3, 1.0), bufferHorseCalfVertices, tallCubePoints.length); },
        null,
        null
    );

}

// 하이어라키 구조로 큐브 여러 개 그리기 예시
let angle = 60; // 회전 각도(도)
let legAngles = [0, 0, 0, 0]; // 각 다리의 각도
let legDirections = [1, 1, 1, 1]; // 각 다리의 회전 방향
let legSpeeds = [1.5, 2.2, 1.0, 2.8];

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 다리 각도 애니메이션 (다리마다 속도 다르게)
    for (let i = 0; i < 4; i++) {
        legAngles[i] += legDirections[i] * legSpeeds[i]; // 각 다리별 속도 적용
        if (legAngles[i] > 30) legDirections[i] = -1;
        if (legAngles[i] < -30) legDirections[i] = 1;
    }

    settingNode(); // 각도 반영해서 노드 재설정
    modelViewMatrix = mat4();
    traverse(0);

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