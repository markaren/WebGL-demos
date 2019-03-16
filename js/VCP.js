/*
Copyright 2014 Aalesund University College

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


"use strict"

var VCP = VCP || {};

VCP.BLACK = 0x000000;
VCP.RED = 0xFF0000;
VCP.GREEN = 0x00FF00;
VCP.BLUE = 0x0000FF;
VCP.YELLOW = 0xFFFF00;
VCP.CYAN = 0x00FFFF;
VCP.PINK = 0xFF00FF;
VCP.GREY = 0xC0C0C0;
VCP.WHITE = 0xFFFFFF;

VCP.AXIS = {
    X: 0,
    Y: 1,
    Z: 2
};

VCP.JOINTTYPES = {
    FIXED: "FIXED",
    RX: "RX",
    RY: "RY",
    RZ: "RZ",
    PX: "PX",
    PY: "PY",
    PZ: "PZ"
};

VCP.WORKSPACE = {
    PERMUT: "0",
    PERMUT_BOUNDARY: "1",
    CONVEX_HULL: "2",
    GRID_POINTS: "3",
	GRID_BOXES: "4"
};

VCP.CONTROLMODE = {
    DIRECT: 0,
    VELOCITY: 1,
    POSITION: 2
};

VCP.SOLVER = {
    PINV: 'pinv',
    DLS: 'dls'
};


/*####################################################*/
/*##################### GRID ########################*/
/*####################################################*/
VCP.Grid = function (size, step) {
    size = size || 10;
    step = step || 1;

    var grid = new THREE.GridHelper(size, step);

    return grid;
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### MIRROR #######################*/
/*####################################################*/
VCP.Mirror = function (size, renderer, camera, texWidth, texheight) {
    THREE.Object3D.call(this);
	//mirror
    var planeGeo = new THREE.PlaneGeometry(size, size);
    this.mirror = new THREE.Mirror(renderer, camera,
{
    clipBias: 0.003,
    textureWidth: texWidth,
    textureHeight: texheight,
    color: 0x777777
});

    this.mirrorMesh = new THREE.Mesh(planeGeo, this.mirror.material);
    this.mirrorMesh.add(this.mirror);
    this.add(this.mirrorMesh);
}

VCP.Mirror.prototype = Object.create(THREE.Object3D.prototype);

VCP.Mirror.prototype.render = function () {
    this.mirror.render();
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### TRANSFORMHELPER  #############*/
/*####################################################*/
VCP.TransformHelper = function (length, headLength, headWidth) {
    length = length || 10;
    headLength = headLength || 0.5;
    headWidth = headWidth || 0.15;

    var helper = new THREE.Object3D();
    helper.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), length, VCP.RED, headLength, headWidth));
    helper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), length, VCP.GREEN, headLength, headWidth));
    helper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), length, VCP.BLUE, headLength, headWidth));

    return helper;
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

VCP.TransformHelper2 = function (size, sphere) {
    THREE.Object3D.call(this);

    size = size || 1;
    
    var length = size;
    var headLength = size * 0.1;
    var headWidth = size * 0.1;

    this.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), length, 0xff0000, headLength, headWidth));
    this.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), length, 0x00ff00, headLength, headWidth));
    this.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), length, 0x0000ff, headLength, headWidth));
    
    if (sphere) {
        
        var geometry = new THREE.SphereGeometry(size * 0.05, 16, 16);
        var material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.9});
        var sphere = new THREE.Mesh(geometry, material);
        this.add(sphere);
    
    }
};

VCP.TransformHelper2.prototype = Object.create(THREE.Object3D.prototype);

/*####################################################*/
/*##################### SKYBOX  ######################*/
/*####################################################*/
VCP.Skybox = function (size) {
    var cubeMap = new THREE.Texture([]);
    cubeMap.format = THREE.RGBFormat;
    cubeMap.flipY = false;

    var loader = new THREE.ImageLoader();
    loader.load('three/examples/textures/skyboxsun25degtest.png', function (image) {

        var getSide = function (x, y) {

            var size = 1024;

            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            var context = canvas.getContext('2d');
            context.drawImage(image, -x * size, -y * size);

            return canvas;

        };

        cubeMap.image[0] = getSide(2, 1); // px
        cubeMap.image[1] = getSide(0, 1); // nx
        cubeMap.image[2] = getSide(1, 0); // py
        cubeMap.image[3] = getSide(1, 2); // ny
        cubeMap.image[4] = getSide(1, 1); // pz
        cubeMap.image[5] = getSide(3, 1); // nz
        cubeMap.needsUpdate = true;

    });

    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    var skyBox = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        skyBoxMaterial
    );

    return skyBox;
};
/*####################################################*/

/*####################################################*/
/*##################### VARIATIONS  ##################*/
/*####################################################*/
VCP.getVariations = function (a, n) {
    // split string
    var temp = a.split("-");
    var l = temp.length;
    var numPermutations = parseInt(Math.pow(l, n));
    var table = new Array(numPermutations);
    for (var i = 0; i < numPermutations; i++) {
        table[i] = new Array(n);
    }

    for (var x = 0; x < n; x++) {
        var t2 = parseInt(Math.pow(l, x));
        for (var p1 = 0; p1 < numPermutations;) {
            for (var al = 0; al < l; al++) {
                for (var p2 = 0; p2 < t2; p2++) {
                    table[p1][x] = temp[al];
                    p1++;
                }
            }
        }
    }

    var result = [];
    for (var i = 0; i < table.length; i++) {
        var tmp = '';
        for (var j = 0; j < table[i].length; j++) {
            tmp += table[i][j];
            if (j !== table[i].length - 1) {
                tmp += ":";
            }
        }
        result.push(tmp);
    }
    return result;
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/


/*####################################################*/
/*##################### Pseudo Inverse  ##############*/
/*####################################################*/
VCP.pinv = function (j) {
    var jt = numeric.transpose(j);
    var jjt = numeric.dot(j, jt);
    return numeric.dot(jt, numeric.inv(jjt));
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### Damped Least Squared  ########*/
/*####################################################*/
VCP.dls = function (j, lamda) {
    var eye = numeric.identity(j.length);

    var jt = numeric.transpose(j);
    var jjt = numeric.dot(j, jt);
    var plus = numeric.mul(eye, lamda * lamda);
    return numeric.dot(jt, numeric.inv(numeric.add(jjt, plus)));
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/


/*####################################################*/
/*##################### arrayToRadians  ##############*/
/*####################################################*/
VCP.arrayToRadians = function (array) {
    array = array.slice() || [];
    for (var i = 0; i < array.length; i++) {
        array[i] = THREE.Math.degToRad(array[i]);
    }
    return array;
}
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### arrayToDegrees  ##############*/
/*####################################################*/
VCP.arrayToDegrees = function (array) {
    array = array.slice() || [];
    for (var i = 0; i < array.length; i++) {
        array[i] = THREE.Math.radToDeg(array[i]);
    }
    return array;
}
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### vectorToDegrees  ##############*/
/*####################################################*/
VCP.vectorToDegrees = function (vector) {
    vector = vector.copy || new THREE.Vector3();
    vector.x = THREE.Math.radToDeg(vector.x);
    vector.y = THREE.Math.radToDeg(vector.y);
    vector.z = THREE.Math.radToDeg(vector.z);
    return vector;
}
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### vectorToRadians  #############*/
/*####################################################*/
VCP.vectorToRadians = function (vector) {
    vector = vector.copy || new THREE.Vector3();
    vector.x = THREE.Math.degToRad(vector.x);
    vector.y = THREE.Math.degToRad(vector.y);
    vector.z = THREE.Math.degToRad(vector.z);
    return vector;
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### extractPosition  #############*/
/*####################################################*/
VCP.extractPosition = function (matrix4) {
    matrix4 = matrix4 || new THREE.Matrix4();
    var elements = matrix4.elements;

    return new THREE.Vector3(elements[12], elements[13], elements[14]);
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### extractEulerRad  #############*/
/*####################################################*/
VCP.extractEuler = function (matrix4) {
    var r = matrix4.elements;
    var r32 = r[6];
    var r33 = r[10];
    var r31 = r[2];
    var r21 = r[1];
    var r11 = r[0];

    var ox = Math.atan2(r32, r33);
    var oy = Math.atan2(-r31, Math.sqrt(Math.pow(r32, 2) + Math.pow(r33, 2)));
    var oz = Math.atan2(r21, r11);

    return new THREE.Vector3(THREE.Math.radToDeg(ox), THREE.Math.radToDeg(oy), THREE.Math.radToDeg(oz));
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### linspace  ####################*/
/*####################################################*/
VCP.linspace = function (x0, x1, num) {
    var list = [];
    var step = Math.abs(x1 - x0) / (num - 1);
    list.push(x0);
    for (var i = 1; i < num - 1; i++) {
        list.push(x0 + (i * step));
    }
    list.push(x1);
    return list;
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### computeTorqes  ###############*/
/*####################################################*/
VCP.calculateTorques = function (values, forces, jacobianFunc) {
    var jacobian = jacobianFunc(values);
    var jt = numeric.transpose(jacobian);

    return numeric.dot(jt, [forces.x, forces.y, forces.z]);

}
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/


/*####################################################*/
/*############# equallySpacedJointValues  ############*/
/*####################################################*/
VCP.equallySpacedJointValues = function (limMin, limMax, numberOfJointHomePositions) {
    numberOfJointHomePositions = numberOfJointHomePositions || 8;

    var numDOF = limMin.length;
    var homePositions = [];
    var jointHomePositions = [];

    for (var i = 0; i < numDOF; i++) {
        jointHomePositions.push(VCP.linspace(limMin[i], limMax[i], numberOfJointHomePositions));
    }
    var sb = '';
    for (var i = 0; i < numberOfJointHomePositions; i++) {
        sb += i;
        if (i !== numberOfJointHomePositions - 1) {
            sb += "-";
        }
    }
    var variations = VCP.getVariations(sb, numDOF);

    for (var i = 0; i < variations.length ; i++) {
        var tmp = variations[i].split(":");
        var aHomePos = new Array(tmp.length);

        for (var j = 0; j < tmp.length; j++) {
            aHomePos[j] = (jointHomePositions[j][parseInt(tmp[j])]);
        }

        homePositions.push(aHomePos);
    }
    return homePositions;
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*############### randomJointValues  #################*/
/*####################################################*/
VCP.randomJointValues = function (limMin, limMax, howMany) {
    howMany = howMany || 5000;
    var numDOF = limMin.length;
    var randomJointValues = [];
    for (var i = 0; i < howMany; i++) {
        var jointValues = [];
        for (var j = 0; j < numDOF; j++) {
            var rand = Math.random() * Math.abs(limMax[j] - limMin[j]) + limMin[j];
            jointValues.push(rand);
        }
        randomJointValues[i] = (jointValues);
    }
    return randomJointValues;

};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*############### cylinderMesh  ######################*/
/*####################################################*/
VCP.cylinderMesh = function (vstart, vend, radius, color) {
    var HALF_PI = Math.PI * .5;
    var distance = vstart.distanceTo(vend);
    var position = vend.clone().add(vstart).divideScalar(2);

    var material = new THREE.MeshBasicMaterial({ color: color });
    var cylinder = new THREE.CylinderGeometry(radius, radius, distance, 10, 10, false);

    var orientation = new THREE.Matrix4();//a new orientation matrix to offset pivot
    var offsetRotation = new THREE.Matrix4();//a matrix to fix pivot rotation
    var offsetPosition = new THREE.Matrix4();//a matrix to fix pivot position
    orientation.lookAt(vstart, vend, new THREE.Vector3(0, 0, 1));//look at destination
    offsetRotation.makeRotationX(HALF_PI);//rotate 90 degs on X
    orientation.multiply(offsetRotation);//combine orientation with rotation transformations
    cylinder.applyMatrix(orientation)

    var mesh = new THREE.Mesh(cylinder, material);
    mesh.position.copy(position);
    return mesh;
}
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

