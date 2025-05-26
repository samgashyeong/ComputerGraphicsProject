"use strict";

var gl, program;
var canvasW = 800, canvasH = 800;
var modelViewLoc, projectionLoc, colorLoc;
var vPosition, vTexCoord, vNormal;
var modelViewMatrix, ptMatrix;
var stack = [];
let angle = 60;

var horseCount = 30;
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0); // 흰색 ambient
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0); // 흰색 diffuse
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0); // 흰색 specular
var lightPosition = vec4(5.0, 5.0, 5.0, 1.0); // 위치형 광원 (point light)

var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var lightPositionLoc;
var shininessLoc;

var materialShininess = 100.0;

const cameraPositions = [
    vec3(3, 2, 4),
    vec3(0, 5, 8),
    vec3(-5, 1, 5),
];


const baseNormals = [
    vec3(0, 0, 1),
    vec3(1, 0, 0),
    vec3(0, -1, 0),
    vec3(0, 1, 0),
    vec3(0, 0, -1),
    vec3(-1, 0, 0)
];


let eyeSlider = { x: 3, y: 2, z: 4 };
let currentCamera = 0;

let horses = [], horsesSpeed = [], horsesCurSpeed = [];
let figure = [], horseType = [], horseHeadSpeed = [];

let currentWeather = "bright";
let currentSeason = "summer";

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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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

// --- Normal vector 생성 ---
function makeNormals() {
    let normals = [];
    for (let i = 0; i < cubeIndices.length; ++i) {
        let faceIndex = Math.floor(i / 6);
        normals.push(baseNormals[faceIndex]);
    }
    return normals;
}

function makeNormals() {
    let normals = [];
    for (let i = 0; i < cubeIndices.length; ++i) {
        let faceIndex = Math.floor(i / 6);
        normals.push(baseNormals[faceIndex]);
    }
    return normals;
}

// --- Buffer & Texture Setup ---
let buffers = {}, textures = {}, texBuffers = {}, texAttribs = {}, normalBuffers = {};

let currentWeatherBuffer = null;
let currentWeatherTexture = null;
let currentWeatherTexBuffer = null;
let currentWeatherNormalBuffer = null;


//메모리 최적화
for (let i = 0; i < 100; i++) figure[i] = createNode(null, null, null, null);

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
const groundPoints = makePoints(groundVertices);
// create normal vector
const cubeNormalPoints = makeNormals();

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
    buffers.ground = createBufferWithData(groundPoints);

    // Texture Buffers (모두 동일 구조라면 하나만 써도 됨)
    texBuffers.brown = createBufferWithData(cubeTexCoords);
    texBuffers.black = createBufferWithData(cubeTexCoords);
    texBuffers.white = createBufferWithData(cubeTexCoords);
    texBuffers.black2 = createBufferWithData(cubeTexCoords);
    texBuffers.yellow = createBufferWithData(cubeTexCoords);
    texBuffers.brown2 = createBufferWithData(cubeTexCoords);
    texBuffers.cloud = createBufferWithData(cubeTexCoords);

    texBuffers.ground = createBufferWithData(groundTexCoords);
    texBuffers.spring = createBufferWithData(groundTexCoords);
    texBuffers.fall = createBufferWithData(groundTexCoords);
    texBuffers.snow = createBufferWithData(groundTexCoords);

    // Texture Objects
    textures.brown = createTextureWithImage("texture/brown_1.png");
    textures.black = createTextureWithImage("texture/black_1.png");
    textures.white = createTextureWithImage("texture/white_1.png");
    textures.black2 = createTextureWithImage("texture/black_2.png");
    textures.yellow = createTextureWithImage("texture/yellow_1.png");
    textures.brown2 = createTextureWithImage("texture/brown_2.png");
    textures.cloud = createTextureWithImage("texture/cloud_1.png");

    textures.ground = createTextureWithImage("texture/ground_1.jpg");
    textures.spring = createTextureWithImage("texture/spring_1.png");
    textures.fall = createTextureWithImage("texture/fall_1.png");
    textures.snow = createTextureWithImage("texture/snow_1.png");
    textures.rain = createTextureWithImage("texture/rain.png");

    // normal vector buffer
    normalBuffers.cube = createBufferWithData(cubeNormalPoints);
    normalBuffers.tallCube = createBufferWithData(cubeNormalPoints);
    normalBuffers.wideCube = createBufferWithData(cubeNormalPoints);
    normalBuffers.horseThigh = createBufferWithData(cubeNormalPoints);
    normalBuffers.horseCalf = createBufferWithData(cubeNormalPoints);
    normalBuffers.horseHoof = createBufferWithData(cubeNormalPoints);
    normalBuffers.trapezoid = createBufferWithData(cubeNormalPoints);
    normalBuffers.horseFrontThigh = createBufferWithData(cubeNormalPoints);
    normalBuffers.horseMane = createBufferWithData(cubeNormalPoints);
    normalBuffers.ground = createBufferWithData(cubeNormalPoints);
    normalBuffers.spring = createBufferWithData(cubeNormalPoints);
    normalBuffers.fall = createBufferWithData(cubeNormalPoints);
    normalBuffers.snow = createBufferWithData(cubeNormalPoints);
    normalBuffers.cloud = createBufferWithData(cubeNormalPoints);

    currentWeatherTexBuffer = texBuffers.ground;
    currentWeatherTexture = textures.ground;
    currentWeatherNormalBuffer = normalBuffers.ground;
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
            2.0 + Math.random() * 1.2,
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
        let horseHs = Math.random() / 10 + 0.1;
        positions.push(horse.position);
        horses.push(horse);
        horsesSpeed.push(horseS);
        horsesCurSpeed.push(0);
        let type = Math.floor(Math.random() * 3);
        horseType.push(type);
        horseHeadSpeed.push(horseHs);
    }
}

// material initialize
const bodyMaterial = {
    ambient: vec4(0.1, 0.1, 0.1, 1.0),
    diffuse: vec4(0.8, 0.8, 0.8, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0)
};
const thighMaterial = {
    ambient: vec4(0.9, 0.2, 0.0, 1.0),
    diffuse: vec4(0.9, 0.7, 0.0, 1.0),
    specular: vec4(0.9, 0.7, 0.0, 1.0)
};
const calfMaterial = {
    ambient: vec4(0.8, 0.2, 0.0, 1.0),
    diffuse: vec4(0.8, 0.7, 0.0, 1.0),
    specular: vec4(0.8, 0.7, 0.0, 1.0)
};
const hoofMaterial = {
    ambient: vec4(0.1, 0.1, 0.1, 1.0),
    diffuse: vec4(0.1, 0.1, 0.1, 1.0),
    specular: vec4(0.8, 0.8, 0.8, 1.0)
};
const groundMaterial = {
    ambient: vec4(1.0, 1.0, 1.0, 1.0),
    diffuse: vec4(0.1, 0.1, 0.1, 1.0),
    specular: vec4(0.0, 0.0, 0.0, 1.0),
}

// Test
const uniformMaterial = {
    ambient: vec4(1.0, 1.0, 1.0, 1.0),
    diffuse: vec4(0.8, 0.8, 0.8, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
}

// 계절별 조명 강도 조절
// const seasonLighting = {
//     spring: {
//         ambient: vec4(0.5,0.5,0.5,1.0),
//         diffuse: vec4(0.8,0.8,0.8,1.0)
//     },
//     summer: {
//         ambient: vec4(0.4,0.4,0.4,1.0),
//         diffuse: vec4(0.7,0.7,0.7,1.0)
//     },
//     fall: {
//         ambient: vec4(0.3,0.3,0.3,1.0),
//         diffuse: vec4(0.5,0.5,0.5,1.0)
//     },
//     winder: {
//         ambient: vec4(0.1,0.1,0.1,1.0),
//         diffuse: vec4(0.3,0.3,0.3,1.0)
//     }
// };

// 날씨별 조명 강도 조절
const weatherLighting = {
    dark: {
        ambient: vec4(0.3, 0.3, 0.3, 1.0),
        diffuse: vec4(0.5, 0.5, 0.5, 1.0)
    },
    bright: {
        ambient: vec4(1.0, 1.0, 1.0, 1.0),
        diffuse: vec4(0.8, 0.8, 0.8, 1.0)
    }
};

function calculateProducts(material) {
    return {
        ambient: mult(lightAmbient, material.ambient),
        diffuse: mult(lightDiffuse, material.diffuse),
        specular: mult(lightSpecular, material.specular)
    };
}


function drawCube(matrix, material, color, buffer, vertexCount, texBuffer = texBuffers.black, texture = textures.black, normalBuffer = normalBuffers.cube) {
    setupAttribute(buffer, vPosition, 4);
    setupAttribute(texBuffer, vTexCoord, 2);
    setupAttribute(normalBuffer, vNormal, 3);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);

    // lighting calculate
    const products = calculateProducts(material);
    gl.uniform4fv(ambientProductLoc, flatten(products.ambient));
    gl.uniform4fv(diffuseProductLoc, flatten(products.diffuse));
    gl.uniform4fv(specularProductLoc, flatten(products.specular));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc, materialShininess);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(matrix));
    gl.uniform4fv(colorLoc, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

}

// --- Node/Hierarchy ---
function createNode(transform, render, sibling, child) {
    return { transform, render, sibling, child };
}

function setTypeHorseTexture(type) {


    let texBuffer, texture, calfTexBuffer, calfTexture;
    if (type === 0) {
        texBuffer = texBuffers.black;
        texture = textures.black;
        calfTexBuffer = texBuffers.black2;
        calfTexture = textures.black2;
    } else if (type === 1) {
        texBuffer = texBuffers.brown;
        texture = textures.brown;
        calfTexBuffer = texBuffers.brown2;
        calfTexture = textures.brown2;
    } else {
        texBuffer = texBuffers.white;
        texture = textures.white;
        calfTexBuffer = texBuffers.yellow;
        calfTexture = textures.yellow;
    }

    return { texBuffer, texture, calfTexBuffer, calfTexture };
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


function settingNode(legAngles, horsePosition, horsesCurSpeed, horseType, horseHeadSpeed) {

    let eye = vec3(eyeSlider.x, eyeSlider.y, eyeSlider.z);
    let mV = mult(
        lookAt(eye, vec3(0, 0, 0), vec3(0, 1, 0)),
        mult(rotate(angle, [0, 1, 0]), scalem(1, 1, 1))
    );

    let { texBuffer, texture, calfTexBuffer: subTexBuffer, calfTexture: subTexture } = setTypeHorseTexture(horseType);


    // 몸통
    figure[0] = createNode(
        mult(mult(mV, translate(horsePosition[0] - horsesCurSpeed + 10, horsePosition[1], horsePosition[2])), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1, 0, 0, 1), buffers.wideCube, wideCubePoints.length, texBuffer, texture, normalBuffers.wideCube),
        null, 1
    );

    // 오른쪽 뒷 허벅지
    figure[1] = createNode(
        mult(translate(0.25, -0.15, -0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseThigh, horseThighPoints.length, texBuffer, texture, normalBuffers.horseThigh),
        5, 2
    );
    // 오른쪽 뒷 종아리
    figure[2] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffer, texture, normalBuffers.tallCube),
        null, 3
    );
    // 오른쪽 뒷 종아리 2
    figure[3] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffer, texture, normalBuffers.horseCalf),
        null, 4
    );
    // 오른쪽 뒷 발굽
    figure[4] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, hoofMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, subTexBuffer, subTexture, normalBuffers.horseHoof),
        null, null
    );

    // 왼쪽 뒷 허벅지
    figure[5] = createNode(
        mult(translate(0.25, -0.15, 0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseThigh, horseThighPoints.length, texBuffer, texture, normalBuffers.horseThigh),
        9, 6
    );
    // 왼쪽 뒷 종아리
    figure[6] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffer, texture, normalBuffers.tallCube),
        null, 7
    );
    // 왼쪽 뒷 종아리 2
    figure[7] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffer, texture, normalBuffers.horseCalf),
        null, 8
    );
    // 왼쪽 뒷 발굽
    figure[8] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, hoofMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, subTexBuffer, subTexture, normalBuffers.horseHoof),
        null, null
    );

    // 꼬리 1
    figure[9] = createNode(
        mult(translate(0.35, 0, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseCalf, horseCalfPoints.length, subTexBuffer, subTexture, normalBuffers.horseCalf),
        11, 10
    );
    // 꼬리 2
    figure[10] = createNode(
        mult(translate(0, -0.15, 0), rotate(legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseCalf, horseCalfPoints.length, subTexBuffer, subTexture, normalBuffers.horseCalf),
        null, null
    );

    // 목 1 (Body와 연결되는 부분)
    figure[11] = createNode(
        mult(translate(-0.35, 0.15, 0), rotate(horseHeadSpeed * legAngles[1] + 240, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffer, texture, normalBuffers.trapezoid),
        15, 12
    );
    // 목 2 (머리와 연결되는 부분)
    figure[12] = createNode(
        mult(translate(0, -0.2, 0), rotate(0, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffer, texture, normalBuffers.trapezoid),
        null, 13
    );
    // 머리 1 (목 2와 연결되는 부분)
    figure[13] = createNode(
        mult(translate(0.1, -0.17, 0), rotate(60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffer, texture, normalBuffers.trapezoid),
        23, 14
    );
    // 머리 2
    figure[14] = createNode(
        mult(translate(0.05, -0.09, -0), rotate(60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.trapezoid, trapezoidPoints.length, texBuffer, texture, normalBuffers.trapezoid),
        null, null
    );

    // 오른쪽 앞 허벅지
    figure[15] = createNode(
        mult(translate(-0.20, -0.15, -0.15), rotate(1 / 5 * legAngles[3], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, texBuffer, texture, normalBuffers.horseFrontThigh),
        19, 16
    );
    // 오른쪽 앞 종아리 1
    figure[16] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffer, texture, normalBuffers.tallCube),
        null, 17
    );
    // 오른쪽 앞 종아리 2
    figure[17] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffer, texture, normalBuffers.horseCalf),
        null, 18
    );
    // 오른쪽 앞 발굽
    figure[18] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, hoofMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, subTexBuffer, subTexture, normalBuffers.horseHoof),
        null, null
    );

    // 왼쪽 앞 허벅지
    figure[19] = createNode(
        mult(translate(-0.20, -0.15, 0.15), rotate(1 / 5 * legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, texBuffer, texture, normalBuffers.horseFrontThigh),
        null, 20
    );
    // 왼쪽 앞 종아리 1
    figure[20] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[0], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.tallCube, tallCubePoints.length, texBuffer, texture, normalBuffers.tallCube),
        null, 21
    );
    // 왼쪽 앞 종아리 2
    figure[21] = createNode(
        mult(translate(0, -0.2, 0), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 1.0, 1.0), buffers.horseCalf, horseCalfPoints.length, texBuffer, texture, normalBuffers.horseCalf),
        null, 22
    );
    // 왼쪽 앞 발굽
    figure[22] = createNode(
        mult(translate(0, -0.1, 0), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, hoofMaterial, vec4(1.0, 1.0, 0.0, 1.0), buffers.horseHoof, horseHoofPoints.length, subTexBuffer, subTexture, normalBuffers.horseHoof),
        null, null
    );

    // 귀 양쪽
    figure[23] = createNode(
        mult(translate(-0.02, -0.3, 0.1), rotate(legAngles[1], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, subTexBuffer, subTexture, normalBuffers.horseFrontThigh),
        24, null
    );
    figure[24] = createNode(
        mult(translate(-0.02, -0.3, -0.1), rotate(legAngles[2], [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.horseFrontThigh, horseFrontThighPoints.length, subTexBuffer, subTexture, normalBuffers.horseFrontThigh),
        25, null
    );

    // 갈귀
    figure[25] = createNode(
        mult(translate(-0.02, -0.3, -0.0), rotate(legAngles[1] + 60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, subTexBuffer, subTexture, normalBuffers.horseMane),
        26,
        null
    );

    figure[26] = createNode(
        mult(translate(-0.1, -0.05, -0.0), rotate(legAngles[2] + 60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, subTexBuffer, subTexture, normalBuffers.horseMane),
        27,
        null
    );


    figure[27] = createNode(
        mult(translate(-0.1, -0.1, -0.0), rotate(legAngles[3] + 60, [0, 0, 1])),
        () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, subTexBuffer, subTexture, normalBuffers.horseMane),
        28,
        null
    );

    for (let i = 28; i <= 36; i++) {
        let y = -0.3 + 0.05 * (i - 25);
        figure[i] = createNode(
            mult(translate(-0.1, y, 0), rotate(legAngles[(i - 25) % 4] + 60, [0, 0, 1])),
            () => drawCube(modelViewMatrix, uniformMaterial, vec4(0.0, 0.0, 0.0, 1.0), buffers.horseMane, horseManePoints.length, subTexBuffer, subTexture, normalBuffers.horseCalf),
            i < 36 ? i + 1 : null,
            null
        );
    }
}

function settingCloud(mv, translateMatrix, scaleX, scaleY, scaleZ) {
    let cloudTexBuffer = texBuffers.cloud;
    let cloudTexture = textures.cloud;
    let cloudNormalBuffer = normalBuffers.cloud;

    let modelViewMatrix = mult(mv, translateMatrix);
    drawCube(modelViewMatrix, bodyMaterial, vec4(1.0, 1.0, 1.0, 1.0), buffers.horseHoof, 36, cloudTexBuffer, cloudTexture, cloudNormalBuffer);
}

// --- Animation ---
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let eye = vec3(eyeSlider.x, eyeSlider.y, eyeSlider.z);
    let mV = mult(
        lookAt(eye, vec3(0, 0, 0), vec3(0, 1, 0)),
        mult(rotate(angle, [0, 1, 0]), scalem(1, 1, 1))
    );
    drawCube(mult(mV, translate(0, -0.7, 0)), groundMaterial, vec4(0.0, 1.0, 0.0, 1.0), buffers.ground, groundPoints.length, currentWeatherTexBuffer, currentWeatherTexture, currentWeatherNormalBuffer);

    if (currentWeather === "dark") {
        renderRain(mV);
    }

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
            settingNode(horse.legAngles, horse.position, horsesCurSpeed[h], horseType[h], horseHeadSpeed[h]);
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
        settingNode(horse.legAngles, vec3(-10, 0, 0), horsesCurSpeed[0], 1, horseHeadSpeed[0]);
        traverse(0);
        settingNode(horse.legAngles, vec3(-10, 0, -4), horsesCurSpeed[0], 0, horseHeadSpeed[0]);
        traverse(0);
        settingNode(horse.legAngles, vec3(-10, 0, -2), horsesCurSpeed[0], 2, horseHeadSpeed[0]);
        traverse(0);
    }





    ptMatrix = perspective(45, canvasW / canvasH, 0.1, 1000.0);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(ptMatrix));
    window.requestAnimFrame(render);
}

// --- UI ---
function setupUI() {
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

    lightPosition = vec4(0.0, 1.0, 0.0, 0.0);
    ["dark", "bright"].forEach(weather => {
        document.getElementById(weather).addEventListener("change", function () {
            if (this.checked) {
                const L = weatherLighting[weather];
                lightAmbient = L.ambient;
                lightDiffuse = L.diffuse;
                currentWeather = weather;
            }

            let seasonColor;
            switch (currentSeason) {
                case "spring":
                    seasonColor = [0.8, 1.0, 0.8, 1.0];
                    break;
                case "summer":
                    seasonColor = [0.0, 1.0, 1.0, 1.0];
                    break;
                case "fall":
                    seasonColor = [1.0, 0.9, 0.6, 1.0];
                    break;
                case "winter":
                    seasonColor = [0.9, 0.95, 1.0, 1.0];
                    break;
            }

            const cloudyColor = [0.6, 0.65, 0.75, 1.0];
            const blendRatio = (currentWeather === "dark") ? 0.6 : 0.0;

            // 색상 혼합 함수
            function mixColor(a, b, t) {
                return a.map((v, i) => v * (1 - t) + b[i] * t);
            }

            // 최종 색상
            const finalColor = mixColor(seasonColor, cloudyColor, blendRatio);
            gl.clearColor(...finalColor);
        });


    });


    document.getElementById("spawnBtn").onclick = function () {
        const count = parseInt(document.getElementById("horseCount").value);
        spawnHorses(count);
    };

    const seasonTextures = {
        spring: textures.spring,
        summer: textures.ground,
        fall: textures.fall,
        winter: textures.snow,
    };

    const seasonTexBuffers = {
        spring: texBuffers.spring,
        summer: texBuffers.ground,
        fall: texBuffers.fall,
        winter: texBuffers.snow,
    };

    const seasonNormalBuffers = {
        spring: normalBuffers.spring,
        summer: normalBuffers.ground,
        fall: normalBuffers.fall,
        winter: normalBuffers.snow,
    };

    ["spring", "summer", "fall", "winter"].forEach(season => {
        document.getElementById(season).addEventListener("change", function () {
            if (this.checked) {
                currentWeatherTexBuffer = seasonTexBuffers[season];
                currentWeatherTexture = seasonTextures[season];
                currentWeatherNormalBuffer = seasonNormalBuffers[season];
                currentSeason = season;
            }


            // 계절별 기본 색상
            let seasonColor;
            switch (season) {
                case "spring":
                    seasonColor = [0.8, 1.0, 0.8, 1.0];
                    break;
                case "summer":
                    seasonColor = [0.0, 1.0, 1.0, 1.0];
                    break;
                case "fall":
                    seasonColor = [1.0, 0.9, 0.6, 1.0];
                    break;
                case "winter":
                    seasonColor = [0.9, 0.95, 1.0, 1.0];
                    break;
            }

            const cloudyColor = [0.6, 0.65, 0.75, 1.0];
            const blendRatio = (currentWeather === "dark") ? 0.6 : 0.0;

            // 색상 혼합 함수
            function mixColor(a, b, t) {
                return a.map((v, i) => v * (1 - t) + b[i] * t);
            }

            // 최종 색상
            const finalColor = mixColor(seasonColor, cloudyColor, blendRatio);
            gl.clearColor(...finalColor);
        });
    });
}

// --- Main ---
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0., 1., 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    modelViewLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix");
    colorLoc = gl.getUniformLocation(program, "uColor");
    vPosition = gl.getAttribLocation(program, "vPosition");
    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    vNormal = gl.getAttribLocation(program, "vNormal");

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    setupBuffersAndTextures();
    setupUI();
    spawnHorses(horseCount);
    initRain();
    render();
};


// --- Rain Effect ---
const RAIN_COUNT = 500;
let rainParticles = [];
let rainLineBuffer = null;
let rainTexBuffer = null;

function initRain() {
    const rainRange = 200;
    rainParticles = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
        rainParticles.push({
            x: Math.random() * rainRange - rainRange / 2,
            y: Math.random() * 3 + 10,
            z: Math.random() * rainRange - rainRange / 2,
            speed: Math.random() * 0.03 + 0.2
        });
    }
    if (!rainLineBuffer) {
        let rainVertices = [
            vec4(0, 0, 0, 1),
            vec4(0, -0.2, 0, 1)
        ];
        rainLineBuffer = createBufferWithData(rainVertices);
        let rainTexCoords = [
            vec2(0.0, 1.0),
            vec2(0.0, 0.0)
        ];
        rainTexBuffer = createBufferWithData(rainTexCoords);
    }
}

function renderRain(mv) {
    const rainRange = 200;
    gl.useProgram(program);
    for (let i = 0; i < rainParticles.length; i++) {
        let p = rainParticles[i];
        p.y -= p.speed;
        if (p.y < -0.7) {
            p.x = Math.random() * rainRange - rainRange / 2;
            p.y = Math.random() * 3 + 10;
            p.z = Math.random() * rainRange - rainRange / 2;
            p.speed = Math.random() * 0.03 + 0.2;
        }
        let modelView = mult(mv, translate(p.x, p.y, p.z));
        drawRainLine(modelView);
    }
}


function drawRainLine(modelViewMatrix) {
    setupAttribute(rainLineBuffer, vPosition, 4);
    setupAttribute(rainTexBuffer, vTexCoord, 2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.rain);
    gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);

    gl.uniform4fv(colorLoc, vec4(1.0, 1.0, 1.0, 1));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINES, 0, 2);
}