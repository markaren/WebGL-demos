/*
Copyright 2014 Aalesund Unviversity College

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

var Kine = function (scene) {
    this.scene = scene;
    this.length = 0;
    this.numDOF = 0;
    this.scene = scene;
    this.localTransMatrices = [];
    this.globalTransMatrices = [];
    this.relativePositions = [];
    this.values = [];
    this.jointPositions = [];
    this.types = [];
    this.limMin = [];
    this.limMax = [];
    this.xyzGroups = [];
    this.jointMeshes = [];
    this.linkMeshes = [];
    this.showXYZ = true;
    this.lambda = 0.1;
    this.integrationSteps = 10;
    this.useFullJacobian = false;
    this.minReach = new THREE.Vector3();
    this.maxReach = new THREE.Vector3();
    this.maxReachLength;
    this.workspaceMesh;
    this.showWorkspace = false;
    this.transform;
    this.endEffectorPosition = new THREE.Vector3();
    this.endPos = 'x=0, y=0, z=0';


    this.addJoint = function (type, relPos) {
        this.types.push(type);
        this.relativePositions.push(relPos);
        if (type === 'RX' || type === 'RY' || type === 'RZ' || type === 'PX' || type === 'PY' || type === 'PZ') {
            this.numDOF += 1;
            var a = 'a' + this.numDOF;
            this[a] = 0;
            if (type === 'RX' || type === 'RY' || type === 'RZ') {
                this.limMin.push(-90);
                this.limMax.push(90);
            } else {
                this.limMin.push(-2);
                this.limMax.push(2);
            }
        }
        this.length += 1;
    };

    this.removeJoint = function () {

        this.scene.remove(this.xyzGroups.pop());
        this.scene.remove(this.jointMeshes.pop());
        this.scene.remove(this.linkMeshes.pop());


        this.jointPositions.pop();
        this.globalTransMatrices.pop();
        this.localTransMatrices.pop();
        this.relativePositions.pop();

        var type = this.types.pop();
        if (type === 'RX' || type === 'RY' || type === 'RZ' || type === 'PX' || type === 'PY' || type === 'PZ') {
            var a = 'a' + this.numDOF;
            delete this.a;
            this.numDOF -= 1;
        }
        this.length -= 1;
    }

    this.finalize = function () {
        this.update();
        this.computeReach();

        this.transform = new THREE.Object3D();
        this.transform.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), length, 0xFF0000, 0.5, 0.15));
        this.transform.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), length, 0x00FF00, 0.5, 0.15));
        this.transform.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), length, 0x0066FF, 0.5, 0.15));
        this.transform.position.copy(kine.jointPositions[kine.jointPositions.length - 1]);
        this.transform.setRotationFromMatrix(kine.globalTransMatrices[kine.globalTransMatrices.length - 1]);

        var mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var sphereGeom = new THREE.SphereGeometry(0.3, 32, 32);
        var cylinderGeom = new THREE.CylinderGeometry(0.3, 0.3, 1, 32);

        for (var i = 0; i < this.length; i++) {

            var pos = this.jointPositions[i];

            var length = 1.5;
            var hex = 0xffff00;
            var xyzGroup = new THREE.Object3D();
            xyzGroup.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), length, 0xFF0000, 0.5, 0.15));
            xyzGroup.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), length, 0x00FF00, 0.5, 0.15));
            xyzGroup.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), length, 0x0066FF, 0.5, 0.15));
            xyzGroup.position.copy(pos);
            this.xyzGroups.push(xyzGroup);

            var type = this.types[i];

            var mesh;

            if (type === 'FIXED') {
                mesh = new THREE.Mesh(sphereGeom, mat);
            } else if (type === 'RX' || type === 'RY' || type === 'RZ') {
                if (type === 'RX') {
                    mesh = new THREE.Mesh(cylinderGeom, mat);
                } else if (type === 'RY') {
                    mesh = new THREE.Mesh(cylinderGeom, mat);
                } else if (type === 'RZ') {
                    mesh = new THREE.Mesh(cylinderGeom, mat);
                }
            } else if (type === 'PX' || type === 'PY' || type === 'PZ') {
                if (type === 'PX') {
                    mesh = new THREE.Mesh(cylinderGeom, mat);
                } else if (type === 'PY') {
                    mesh = new THREE.Mesh(cylinderGeom, mat);
                } else if (type === 'PZ') {
                    mesh = new THREE.Mesh(cylinderGeom, mat);
                }
            }
            if (mesh) {
                mesh.position.copy(pos);
                this.jointMeshes.push(mesh);
                this.scene.add(mesh);
            }
        }

        for (var i = 0; i < this.length - 1; i++) {
            var type = this.types[i+1];
            if (type === 'RX' || type === 'RY' || type === 'RZ' || type === 'FIXED') {
                var v1 = this.jointPositions[i];
                var v2 = this.jointPositions[i + 1];
                var mesh = cylinderMesh(v1, v2, 0.2, 0x0000ff);
                this.linkMeshes[i] = (mesh);
                this.scene.add(mesh);
            }
        }

        var mat = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true, transparent: true, opacity: 0.5 });
        var convex = new THREE.ConvexGeometry(this.randomPositions(1500 * this.numDOF));
        this.workspaceMesh = new THREE.Mesh(convex, mat);
    }

    this.draw = function () {

        for (var i = 0; i < this.length - 1; i++) {
            var type = this.types[i+1];
            var v1 = this.jointPositions[i];
            var v2 = this.jointPositions[i + 1];
            if (type === 'PX' || type === 'PY' || type === 'PZ') {
                this.scene.remove(this.linkMeshes[i]);
                var mesh = cylinderMesh(v1, v2, 0.2, 0x0000ff);
                this.linkMeshes[i] = (mesh);
                this.scene.add(mesh);
            } else {
                var distance = v1.distanceTo(v2);
                var position = v2.clone().add(v1).divideScalar(2);
                this.linkMeshes[i].position.copy(position);
                this.linkMeshes[i].setRotationFromMatrix(this.globalTransMatrices[i]);
            }
        }

        for (var i = 0; i < this.length; i++) {
            var pos = this.jointPositions[i];
            var type = this.types[i];

            var xyz = this.xyzGroups[i];
            xyz.position.copy(pos);
            xyz.setRotationFromMatrix(this.globalTransMatrices[i]);

            if (this.showXYZ) {
                scene.add(xyz);
            } else {
                scene.remove(xyz);
            }

            var jointMesh = this.jointMeshes[i];
            jointMesh.position.copy(pos);
            jointMesh.setRotationFromMatrix(this.globalTransMatrices[i]);

            if (type === 'PX' || type === 'RX') {
                jointMesh.rotateZ(Math.PI / 2);
            } else if (type === 'PZ' || type === 'RZ') {
                jointMesh.rotateX(Math.PI / 2);
            }
        }

        if (this.showWorkspace) {
            this.scene.add(this.workspaceMesh);
        } else {
            this.scene.remove(this.workspaceMesh);
        }
    }

    this.update = function (mode) {
        this.values = [];
        for (var i = 1; i <= this.numDOF; i++) {
            this.values.push(this['a' + i]);
        }
        this.globalTransMatrices = [];
        this.jointPositions = [];
        var vals = this.values.slice();
        for (var i = 0; i < this.length; i++) {
            var transMatrix = this.getTransformationMatrix(this.types[i], this.relativePositions[i], vals);
            this.localTransMatrices.push(transMatrix);
            var globalTransMatrix = transMatrix;
            if (i === 0) {
                this.globalTransMatrices.push(transMatrix);
            } else {
                var prevMatrix = new THREE.Matrix4().copy(this.globalTransMatrices[i - 1]);
                globalTransMatrix = prevMatrix.multiply(transMatrix);
                this.globalTransMatrices.push(globalTransMatrix);
            }
            var jointPos = new THREE.Vector3(this.globalTransMatrices[i].elements[12], this.globalTransMatrices[i].elements[13], this.globalTransMatrices[i].elements[14]);
            this.jointPositions.push(jointPos);
        }

        this.endEffectorPosition = this.jointPositions[i-1];
        this.endPos = 'x=' + this.endEffectorPosition.x.toPrecision(3) + ', y=' + this.endEffectorPosition.y.toPrecision(3) + ', z=' + this.endEffectorPosition.z.toPrecision(3);
       
        if (mode === MODE.TRANSFORM) {
            var vals = this.values.slice();
            for (var j = 0; j < this.integrationSteps; j++) {
                var inv;
                var thetas;

                var tpos = this.transform.position;
                var trot = this.transform.rotation;

                if (!this.useFullJacobian) {
                    var kpos = this.getPosition(vals);

                    inv = numeric.dls(this.halfJacobian(vals), this.lambda);
                    thetas = numeric.dot(inv, [tpos.x - kpos.x, tpos.y - kpos.y, tpos.z - kpos.z]);
                } else {
                    var posAndEuler = this.getPositionAndEuler(vals);
                    var kpos = new THREE.Vector3(posAndEuler[0], posAndEuler[1], posAndEuler[2]);
                    var krot = new THREE.Vector3(posAndEuler[3], posAndEuler[4], posAndEuler[5]);

                    inv = numeric.dls(this.fullJacobian(vals), this.lambda);
                    thetas = numeric.dot(inv, [tpos.x - kpos.x, tpos.y - kpos.y, tpos.z - kpos.z, trot.x - krot.x, trot.y - krot.y, trot.z - krot.z]);
                }
                for (var i = 0; i < vals.length; i++) {
                    vals[i] = vals[i] + (thetas[i]);
                    if (vals[i] > this.limMax[i]) {
                        vals[i] = this.limMax[i];
                    } else if (vals[i] < this.limMin[i]) {
                        vals[i] = this.limMin[i];
                    }
                }
            }

            for (var i = 1; i <= this.numDOF; i++) {
                this['a' + i] = vals[i - 1];
            }
        } 
    };

    this.halfJacobian = function (values) {
        var h = 0.01;

        var rows = 3;
        var cols = this.numDOF;
        var jacobian = new Array(rows);
        for (var i = 0; i < rows; i++) {
            jacobian[i] = (new Array(cols));
        }

        for (var i = 0; i < cols; i++) {
            var vals = values.slice();
            vals[i] = vals[i] + h;
            var d1 = this.getPosition(vals);
            var d2 = this.getPosition(values);

            jacobian[0][i] = (d1.x - d2.x) / h;
            jacobian[1][i] = (d1.y - d2.y) / h;
            jacobian[2][i] = (d1.z - d2.z) / h;
        }

        return jacobian;
    };

    this.fullJacobian = function (values) {
        var h = 0.01;

        var rows = 6;
        var cols = this.numDOF;
        var jacobian = new Array(rows);
        for (var i = 0; i < rows; i++) {
            jacobian[i] = (new Array(cols));
        }

        for (var i = 0; i < cols; i++) {
            var vals = values.slice();
            vals[i] = vals[i] + h;
            var d1 = this.getPosition(vals);
            var d2 = this.getPosition(values);
            var d3 = this.getEuler(vals);
            var d4 = this.getEuler(values);

            jacobian[0][i] = (d1.x - d2.x) / h;
            jacobian[1][i] = (d1.y - d2.y) / h;
            jacobian[2][i] = (d1.z - d2.z) / h;
            jacobian[3][i] = (d3.x - d4.x) / h;
            jacobian[4][i] = (d3.y - d4.y) / h;
            jacobian[5][i] = (d3.z - d4.z) / h;
        }

        return jacobian;
    };

    this.getTransformationMatrix = function (type, p, values) {
        var a = 0;
        if (type === 'RX' || type === 'RY' || type === 'RZ' || type === 'PX' || type === 'PY' || type === 'PZ') {
            if (type === 'RX' || type === 'RY' || type === 'RZ') {
                a = THREE.Math.degToRad(values.splice(0, 1)[0]);
            } else {
                a = values.splice(0, 1)[0];
            }

        }
        if (type === 'FIXED') {
            return new THREE.Matrix4(
                1, 0, 0, p.x,
                0, 1, 0, p.y,
                0, 0, 1, p.z,
                0, 0, 0, 1);
        } else if (type === 'RX') {
            return new THREE.Matrix4(
                1, 0, 0, p.x,
                0, Math.cos(a), -Math.sin(a), p.y,
                0, Math.sin(a), Math.cos(a), p.z,
                0, 0, 0, 1);
        } else if (type === 'RY') {
            return new THREE.Matrix4(
                Math.cos(a), 0, Math.sin(a), p.x,
                0, 1, 0, p.y,
                -Math.sin(a), 0, Math.cos(a), p.z,
                0, 0, 0, 1);
        } else if (type === 'RZ') {
            return new THREE.Matrix4(
                Math.cos(a), -Math.sin(a), 0, p.x,
                Math.sin(a), Math.cos(a), 0, p.y,
                0, 0, 1, p.z,
                0, 0, 0, 1);
        } else if (type === 'PX') {
            return new THREE.Matrix4(
                1, 0, 0, p.x + a,
                0, 1, 0, p.y,
                0, 0, 1, p.z,
                0, 0, 0, 1);
        } else if (type === 'PY') {
            return new THREE.Matrix4(
                1, 0, 0, p.x,
                0, 1, 0, p.y + a,
                0, 0, 1, p.z,
                0, 0, 0, 1);
        } else if (type === 'PZ') {
            return new THREE.Matrix4(
                1, 0, 0, p.x,
                0, 1, 0, p.y,
                0, 0, 1, p.z + a,
                0, 0, 0, 1);
        } else {
            return new THREE.Matrix4();
        }
    };

    this.tearDown = function () {
        var it = this.length;
        for (var i = 0; i < it; i++) {
            this.removeJoint();
        }
        this.scene.remove(this.workspaceMesh);
        this.scene.remove(this.transform);

    };

    this.computeReach = function () {
        var howMany = 10000;
        var randomPositions = this.randomPositions(howMany);

        var xmin, xmax, ymin, ymax, zmin, zmax;

        for (var i = 0; i < randomPositions.length; i++) {
            var pos = randomPositions[i];

            var x = pos.x;
            var y = pos.y;
            var z = pos.z;
            if (i === 0) {
                xmin = x;
                xmax = x;
                ymin = y;
                ymax = y;
                zmin = z;
                zmax = z;
            } else {
                if (xmin > x) {
                    xmin = x;
                } else if (xmax < x) {
                    xmax = x;
                }
                if (ymin > y) {
                    ymin = y;
                } else if (ymax < y) {
                    ymax = y;
                }
                if (zmin > z) {
                    zmin = z;
                } else if (xmax < z) {
                    zmax = z;
                }
            }
        }

        this.minReach = new THREE.Vector3(xmin, ymin, zmin);
        this.maxReach = new THREE.Vector3(xmax, ymax, zmax);

        this.maxReachLength = 0;
        var xReacMax = Math.abs(this.maxReach.x - this.minReach.x);
        var yReacMax = Math.abs(this.maxReach.y - this.minReach.y);
        var zReacMax = Math.abs(this.maxReach.z - this.minReach.z);
        if (xReacMax > this.maxReachLength) {
            this.maxReachLength = xReacMax;
        }
        if (yReacMax > this.maxReachLength) {
            this.maxReachLength = yReacMax;
        }
        if (zReacMax > this.maxReachLength) {
            this.maxReachLength = zReacMax;
        }
    }

    this.randomPositions = function (howMany) {
        var randPositions = [];
        for (var i = 0; i < howMany; i++) {
            var randValues = [];
            for (var j = 0; j < this.numDOF; j++) {
                randValues.push(Math.random() * Math.abs(this.limMax[j] - this.limMin[j]) + this.limMin[j]);
            }
            randPositions.push(this.getPosition(randValues));
        }
        return randPositions;
    }


    this.getPositionAndEuler = function (values) {
        var vals = values.slice();
        var transMatrix;
        for (var i = 0; i < this.types.length; i++) {
            var mat = this.getTransformationMatrix(this.types[i], this.relativePositions[i], vals);
            if (i === 0) {
                transMatrix = mat;
            } else {
                transMatrix = transMatrix.multiply(mat);
            }
        }
        var r = transMatrix.elements;
        var r32 = transMatrix.elements[6];
        var r33 = transMatrix.elements[10];
        var r31 = transMatrix.elements[2];
        var r21 = transMatrix.elements[1];
        var r11 = transMatrix.elements[0];

        var px = r[12];
        var py = r[13];
        var pz = r[14];
        var ox = Math.atan2(r32, r33);
        var oy = Math.atan2(-r31, Math.sqrt(Math.pow(r32, 2) + Math.pow(r33, 2)));
        var oz = Math.atan2(r21, r11);

        return [px, py, pz, ox, oy, oz];

    }

    this.getPosition = function (values) {
        var vals = values.slice();
        var transMatrix;
        for (var i = 0; i < this.types.length; i++) {
            var mat = this.getTransformationMatrix(this.types[i], this.relativePositions[i], vals);
            if (i === 0) {
                transMatrix = mat;
            } else {
                transMatrix = transMatrix.multiply(mat);
            }
        }
        var r = transMatrix.elements;

        return new THREE.Vector3(r[12], r[13], r[14]);
    }

    this.getEuler = function (values) {
        var vals = values.slice();
        var transMatrix;
        for (var i = 0; i < this.types.length; i++) {
            var mat = this.getTransformationMatrix(this.types[i], this.relativePositions[i], vals);
            if (i === 0) {
                transMatrix = mat;
            } else {
                transMatrix = transMatrix.multiply(mat);
            }
        }
        var r = transMatrix.elements;

        var r32 = transMatrix.elements[6];
        var r33 = transMatrix.elements[10];
        var r31 = transMatrix.elements[2];
        var r21 = transMatrix.elements[1];
        var r11 = transMatrix.elements[0];

        var x = Math.atan2(r32, r33);
        var y = Math.atan2(-r31, Math.sqrt(Math.pow(r32, 2) + Math.pow(r33, 2)));
        var z = Math.atan2(r21, r11);

        return new THREE.Vector3(x, y, z);
    }

    var cylinderMesh = function (vstart, vend, radius, color) {
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

    this.getEquallySpacedJointValues = function (howMany) {
        var numberOfJointHomePositions = 8;
       // console.log(numberOfJointHomePositions);
        var homePositions = [];
        var jointHomePositions = [];

        for (var i = 0; i < this.numDOF; i++) {
            var max = this.limMax[i];
            var min = this.limMin[i];
            var list = [];
            var step = Math.abs(max - min) / (numberOfJointHomePositions - 1);
            //console.log(step);
            list.push(max);
            for (var k = 1; k < numberOfJointHomePositions - 1; k++) {
                var val = max - (k * step);
                //console.log(k + " " + val);
                list.push(val);
            }
            list.push(min);
            jointHomePositions.push(list);
        }
        var sb = '';
        for (var i = 0; i < numberOfJointHomePositions; i++) {
            sb += i;
            if (i !== numberOfJointHomePositions - 1) {
                sb += "-";
            }
        }
        var perm = new Permut(sb, this.numDOF);
        var variations = perm.getVariations();

        for (var i = 0; i < variations.length ; i++) {
            var tmp = variations[i].split(":");
            var aHomePos = new Array(tmp.length);

            for (var j = 0; j < tmp.length; j++) {
                aHomePos[j] = jointHomePositions[j][parseInt(tmp[j])];
            }
            homePositions.push(aHomePos);
        }
        return homePositions;
    }

};
