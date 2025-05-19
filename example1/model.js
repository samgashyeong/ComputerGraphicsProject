// 예시: 하이어라키 구조(몸통과 팔)
// filepath: c:\Users\samga\Documents\GitHub\ComputerGraphicsProject\model.js

// 필요한 MV.js의 mat4, mult, translate, rotate, scale 등 함수 사용

const cubeVertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4( 0.5,  0.5,  0.5, 1.0),
    vec4( 0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4( 0.5,  0.5, -0.5, 1.0),
    vec4( 0.5, -0.5, -0.5, 1.0)
];

// 기존 tallCubeVertices보다 전체적으로 더 작게(예: x, y, z 모두 0.3배) 만듦
const tallCubeVertices = [
    vec4(-0.05, -0.15,  0.05, 1.0),
    vec4(-0.05,  0.15,  0.05, 1.0),
    vec4( 0.05,  0.15,  0.05, 1.0),
    vec4( 0.05, -0.15,  0.05, 1.0),
    vec4(-0.05, -0.15, -0.05, 1.0),
    vec4(-0.05,  0.15, -0.05, 1.0),
    vec4( 0.05,  0.15, -0.05, 1.0),
    vec4( 0.05, -0.15, -0.05, 1.0)
];

const wideCubeVertices = [
    vec4(-0.3, -0.15,  0.15, 1.0),
    vec4(-0.3,  0.15,  0.15, 1.0),
    vec4( 0.3,  0.15,  0.15, 1.0),
    vec4( 0.3, -0.15,  0.15, 1.0),
    vec4(-0.3, -0.15, -0.15, 1.0),
    vec4(-0.3,  0.15, -0.15, 1.0),
    vec4( 0.3,  0.15, -0.15, 1.0),
    vec4( 0.3, -0.15, -0.15, 1.0)
];

const horseThighVertices = [
    vec4(-0.125, -0.125,  0.025, 1.0),
    vec4(-0.125,  0.125,  0.025, 1.0),
    vec4( 0.125,  0.125,  0.025, 1.0),
    vec4( 0.125, -0.125,  0.025, 1.0),
    vec4(-0.125, -0.125, -0.025, 1.0),
    vec4(-0.125,  0.125, -0.025, 1.0),
    vec4( 0.125,  0.125, -0.025, 1.0),
    vec4( 0.125, -0.125, -0.025, 1.0)
];

const horseCalfVertices = [
    vec4(-0.025, -0.075,  0.025, 1.0),
    vec4(-0.025,  0.075,  0.025, 1.0),
    vec4( 0.025,  0.075,  0.025, 1.0),
    vec4( 0.025, -0.075,  0.025, 1.0),
    vec4(-0.025, -0.075, -0.025, 1.0),
    vec4(-0.025,  0.075, -0.025, 1.0),
    vec4( 0.025,  0.075, -0.025, 1.0),
    vec4( 0.025, -0.075, -0.025, 1.0)
];

const horseHoofVertices = [
    vec4(-0.05, -0.025,  0.05, 1.0),
    vec4(-0.05,  0.025,  0.05, 1.0),
    vec4( 0.05,  0.025,  0.05, 1.0),
    vec4( 0.05, -0.025,  0.05, 1.0),
    vec4(-0.05, -0.025, -0.05, 1.0),
    vec4(-0.05,  0.025, -0.05, 1.0),
    vec4( 0.05,  0.025, -0.05, 1.0),
    vec4( 0.05, -0.025, -0.05, 1.0)
];
function draw() {
    // 1. 몸통 변환 행렬
    let torsoMatrix = mat4();
    torsoMatrix = mult(torsoMatrix, translate(0, 0, 0));
    torsoMatrix = mult(torsoMatrix, scale(0.5, 1.0, 0.2));
    // 몸통 그리기
    drawCube(torsoMatrix);

    // 2. 팔 변환 행렬 (몸통의 변환을 먼저 곱함)
    let armMatrix = mult(torsoMatrix, translate(0.6, 0.4, 0));
    armMatrix = mult(armMatrix, rotate(45, 0, 0, 1)); // 팔 회전
    armMatrix = mult(armMatrix, scale(0.2, 0.6, 0.2));
    // 팔 그리기
    drawCube(armMatrix);
}

// 행렬을 uniform으로 넘기고 큐브를 그리는 함수 예시
function drawCube(modelMatrix) {
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    // ...버퍼 바인딩 및 그리기...
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}