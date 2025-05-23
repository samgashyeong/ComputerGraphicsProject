// 각 면의 텍스처 좌표 (정사각형 기준)
const faceTexCoords = [
    vec2(0, 0), // 왼쪽 아래
    vec2(1, 0), // 오른쪽 아래
    vec2(1, 1), // 오른쪽 위
    vec2(0, 1)  // 왼쪽 위
];

// cubeIndices와 동일한 순서로 텍스처 좌표를 36개 생성
let cubeTexCoords = [];
for (let f = 0; f < 6; ++f) {
    // 각 면마다 두 삼각형(6개 인덱스)
    cubeTexCoords.push(faceTexCoords[0], faceTexCoords[1], faceTexCoords[3]); // 삼각형1
    cubeTexCoords.push(faceTexCoords[1], faceTexCoords[2], faceTexCoords[3]); // 삼각형2
}

// 필요하다면 다른 큐브(말 부위)도 동일하게 생성
let tallCubeTexCoords = cubeTexCoords.slice();
let wideCubeTexCoords = cubeTexCoords.slice();
let horseThighTexCoords = cubeTexCoords.slice();
let horseFrontThighTexCoords = cubeTexCoords.slice();
let horseCalfTexCoords = cubeTexCoords.slice();
let horseHoofTexCoords = cubeTexCoords.slice();
let trapezoidTexCoords = cubeTexCoords.slice();
let horseManeTexCoords = cubeTexCoords.slice();
let groundTexCoords = [
    vec2(0, 0), vec2(1, 0), vec2(1, 1),
    vec2(0, 0), vec2(1, 1), vec2(0, 1)
];