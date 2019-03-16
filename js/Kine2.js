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

/*####################################################*/
/*##################### KINE #########################*/
/*####################################################*/
VCP.Kine = function () {
	THREE.Object3D.call(this);
    this.numDOF = 0;
    this.length = 0;

    this.boundingBox;
    this.workspace = VCP.WORKSPACE.CONVEX_HULL;

    this.controlMode = VCP.CONTROLMODE.DIRECT;
    this.velSolver = VCP.SOLVER.PINV;
    this.posSolver = VCP.SOLVER.DLS;

    this.limMin = [];
    this.limMax = [];

    this.h = 6;
    this.permut = new THREE.Object3D();
    this.permutBoundary = new THREE.Object3D();
    this.convex = new THREE.Object3D();

    this.types = [];
    this.jointPositions = [];
    this.relativePositions = [];

    this.endEffectorPosition = new THREE.Vector3();
    this.endEffectorOrientation = new THREE.Vector3();

    this.localTransMatrices = [];
    this.globalTransMatrices = [];

    this.jointMeshes = [];
    this.linkMeshes = [];

    this.XYZHelpers = [];
    this.targetHelper;

    this.showXYZ = true;
    this.showBoundingBox = false;
    this.showWorkspace = false;
    this.showTarget = false;

    this.lambda = 0.1;
    this.useFullJacobian = false;

    this.endSpeed = {
        vx: 0.0,
        vy: 0.0,
        vz: 0.0,
    };

    this.endPos = {
        px: 0.0,
        py: 0.0,
        pz: 0.0,
        ox: 0.0,
        oy: 0.0,
        oz: 0.0
    };


    var that = this;
    this.setDirectMode = function (value) {
        that.controlMode = VCP.CONTROLMODE.DIRECT;
        that.endSpeed.vx = 0.0;
        that.endSpeed.vy = 0.0;
        that.endSpeed.vz = 0.0;
    }
    this.setVelocityMode = function (value) {
        that.controlMode = VCP.CONTROLMODE.VELOCITY;
    }
    this.setPositionMode = function (value) {
        that.controlMode = VCP.CONTROLMODE.POSITION;
        that.endSpeed.vx = 0.0;
        that.endSpeed.vy = 0.0;
        that.endSpeed.vz = 0.0;
    }
    this.toggleXYZVisibility = function (value) {
        if (value) {
            for (var i = 0; i < that.length; i++) {
                that.add(that.XYZHelpers[i]);
            }
        } else {
            for (var i = 0; i < that.length; i++) {
                that.remove(that.XYZHelpers[i]);
            }
        }

    }
    this.toggleBoundingBoxVisibility = function (value) {
        if (value) {
            that.add(that.boundingBox);
        } else {
            that.remove(that.boundingBox);
        }
    }
    this.toggleWorkspaceVisibility = function (value) {
        if (that.showWorkspace) {
            if (that.workspace === "0") {
                that.remove(that.convex);
                that.remove(that.permutBoundary);
                that.add(that.permut);
            } else if (that.workspace === "1") {
                that.remove(that.convex);
                that.remove(that.permut);
                that.add(that.permutBoundary);
            } else if (that.workspace === "2") {
                that.remove(that.permutBoundary);
                that.remove(that.permut);
                that.add(that.convex);
            }
        } else {
            that.remove(that.convex);
            that.remove(that.permut);
            that.remove(that.permutBoundary);
        }
    }
    this.toggleTargetVisibility = function (value) {
        if (value) {
            that.add(that.targetHelper);
        } else {
            that.remove(that.targetHelper);
        }
    }
    this.setDirectMode = function (value) {
        that.controlMode = VCP.CONTROLMODE.DIRECT;
        that.endSpeed.vx = 0.0;
        that.endSpeed.vy = 0.0;
        that.endSpeed.vz = 0.0;
    }
    this.setVelocityMode = function (value) {
        that.controlMode = VCP.CONTROLMODE.VELOCITY;
    }
    this.setPositionMode = function (value) {
        that.controlMode = VCP.CONTROLMODE.POSITION;
        that.endSpeed.vx = 0.0;
        that.endSpeed.vy = 0.0;
        that.endSpeed.vz = 0.0;
    }


    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 81: // Q
                that.setDirectMode();
                break;
        }
    });
};

VCP.Kine.prototype = Object.create(THREE.Object3D.prototype);

VCP.Kine.prototype.addJoint = function (type, relPos, limMin, limMax) {
    type = type || VCP.JOINTTYPES.FIXED;
    relPos = relPos || new THREE.Vector3();

    this.types.push(type);
    this.relativePositions.push(relPos);

    if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ || type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
        this.numDOF++;
        var j = 'j' + this.numDOF;
        this[j] = 0;
        if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ) {
            limMin = limMin || -90;
            limMax = limMax || 90;

        } else {
            limMin = limMin || -1;
            limMax = limMax || 1;
        }

        this.limMin.push(limMin);
        this.limMax.push(limMax);
    }
    this.length++;
};

VCP.Kine.prototype.removeJoint = function () {

    this.types.pop();
    this.jointPositions.pop();
    this.relativePositions.pop();

   

    this.localTransMatrices.pop();
    this.globalTransMatrices.pop();

    this.XYZHelpers.pop();

    if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ || type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
        this.limMin.pop();
        this.limMax.pop();
        delete this['j' + this.numDOF];
        this.numDOF--;
    }
    this.length--;
};

VCP.Kine.prototype.finalize = function () {
    this.update();
    this.computeReach(this.h);

    var maxVal = this.boundingBox.maxValue;
    for (var i = 0; i < this.length; i++) {
        var helper = new VCP.TransformHelper(maxVal / 20, maxVal / 100, maxVal / 100);
        helper.position.copy(this.jointPositions[i]);
        helper.setRotationFromMatrix(this.globalTransMatrices[i]);
        this.XYZHelpers.push(helper);
        this.add(helper);
    }

    this.targetHelper = new VCP.TransformHelper(maxVal / 10, maxVal / 80, maxVal / 80);

    var mat = new THREE.MeshBasicMaterial({ color: VCP.RED });
    var sphereGeom = new THREE.SphereGeometry(0.3, 32, 32);
    var cylinderGeom = new THREE.CylinderGeometry(0.3, 0.3, 1, 32);

    for (var i = 0; i < this.length; i++) {
        var pos = this.jointPositions[i];
        var type = this.types[i];
        var mesh;
        if (type === VCP.JOINTTYPES.FIXED) {
            mesh = new THREE.Mesh(sphereGeom, mat);
        } else if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ) {
            if (type === VCP.JOINTTYPES.RX) {
                mesh = new THREE.Mesh(cylinderGeom, mat);
            } else if (type === VCP.JOINTTYPES.RY) {
                mesh = new THREE.Mesh(cylinderGeom, mat);
            } else if (type === VCP.JOINTTYPES.RZ) {
                mesh = new THREE.Mesh(cylinderGeom, mat);
            }
        } else if (type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
            if (type === VCP.JOINTTYPES.PX) {
                mesh = new THREE.Mesh(cylinderGeom, mat);
            } else if (type === VCP.JOINTTYPES.PY) {
                mesh = new THREE.Mesh(cylinderGeom, mat);
            } else if (type === VCP.JOINTTYPES.PZ) {
                mesh = new THREE.Mesh(cylinderGeom, mat);
            }
        }
        mesh.position = pos;
        this.jointMeshes.push(mesh);
        this.add(mesh);
    }

    for (var i = 0; i < this.length - 1; i++) {
        var type = this.types[i + 1];
        if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ || type === VCP.JOINTTYPES.FIXED) {
            var v1 = this.jointPositions[i];
            var v2 = this.jointPositions[i + 1];
            var mesh = VCP.cylinderMesh(v1, v2, 0.2, VCP.BLUE);
            this.linkMeshes[i] = (mesh);
            this.add(mesh);
        }
    }

};

VCP.Kine.prototype.tearDown = function () {

    for (var i = 0; i < this.permut.children.length; i++) {
        this.permut.children.pop();
    }
    for (var i = 0; i < this.permutBoundary.children.length; i++) {
        this.permutBoundary.children.pop();
    }
    for (var i = 0; i < this.boundingBox.children.length; i++) {
        this.boundingBox.children.pop();
    }
    for (var i = 0; i < this.convex.children.length; i++) {
        this.convex.children.pop();
    }

    for (var i = 0; i < this.XYZHelpers.length; i++) {
        this.remove(this.XYZHelpers[i]);
    }

    for (var i = 0; i < this.jointMeshes.length; i++) {
        this.remove(this.jointMeshes[i]);
    }

    for (var i = 0; i < this.linkMeshes.length; i++) {
        this.remove(this.linkMeshes[i]);
    }

    this.remove(this.permut);
    this.remove(this.permutBoundary);
    this.remove(this.convex);
    this.remove(this.boundingBox);
    this.remove(this.targetHelper);
}

VCP.Kine.prototype.update = function (delta) {

    var values = [];
    for (var i = 1; i <= this.numDOF; i++) {
        values.push(this['j' + i]);
    }

    if (this.controlMode === VCP.CONTROLMODE.VELOCITY) {

        var vals = values.slice();
        var J = this.halfJacobian((vals));
        var actual = this.endEffectorPosition;
        var desired = this.endEffectorPosition.clone().add((new THREE.Vector3(this.endSpeed.vx, this.endSpeed.vy, this.endSpeed.vz).multiplyScalar(delta)));


        for (var j = 0; j < 100; j++) {
            var speeds = [desired.x - actual.x, desired.y - actual.y, desired.z - actual.z];
            var inv;
            if (this.velSolver === 'pinv') {
                inv = VCP.pinv(J);
            } else if (this.velSolver === 'dls') {
                inv = VCP.dls(J, 0.1);
            } else {
                throw 'No valid solver ha been selected';
            }
            var theta_dot = numeric.dot(inv, speeds);

            for (var i = 0; i < vals.length; i++) {
                vals[i] = vals[i] + (theta_dot[i]);
                if (vals[i] > this.limMax[i]) {
                    vals[i] = this.limMax[i];
                } else if (vals[i] < this.limMin[i]) {
                    vals[i] = this.limMin[i];
                }
            }
            J = this.halfJacobian((vals));
            actual = this.getPosition((vals));
        }

        for (var i = 1; i <= this.numDOF; i++) {
            this['j' + i] = vals[i - 1];;
        }

    } else if (this.controlMode === VCP.CONTROLMODE.POSITION) {
        var vals = values.slice();
        var J, actual, desired;
        if (!this.useFullJacobian) {
            J = this.halfJacobian((vals));
            actual = [this.endEffectorPosition.x, this.endEffectorPosition.y, this.endEffectorPosition.z];
            desired = [this.endPos.px, this.endPos.py, this.endPos.pz];
        } else {
            J = this.fullJacobian((vals));
            actual = [this.endEffectorPosition.x, this.endEffectorPosition.y, this.endEffectorPosition.z, this.endEffectorOrientation.x, this.endEffectorOrientation.y, this.endEffectorOrientation.z];
            desired = [this.endPos.px, this.endPos.py, this.endPos.pz, this.endPos.ox, this.endPos.oy, this.endPos.oz];
        }


        for (var j = 0; j < 100; j++) {

            var speeds;
            if (!this.useFullJacobian) {
                speeds = [desired[0] - actual[0], desired[1] - actual[1], desired[2] - actual[2]];
            } else {
                speeds = [desired[0] - actual[0], desired[1] - actual[1], desired[2] - actual[2], desired[3] - actual[3], desired[4] - actual[4], desired[5] - actual[5]];
            }
            var inv;
            if (this.posSolver === 'pinv') {
                inv = VCP.pinv(J);
            } else if (this.posSolver === 'dls') {
                try {
                    inv = VCP.dls(J, this.lambda);
                } catch (TypeError) {
                    throw J;
                }
            } else {
                throw 'No valid solver ha been selected';
            }
            var theta_dot = numeric.dot(inv, speeds);

            for (var i = 0; i < vals.length; i++) {
                vals[i] = vals[i] + (theta_dot[i]);
                if (vals[i] > this.limMax[i]) {
                    vals[i] = this.limMax[i];
                } else if (vals[i] < this.limMin[i]) {
                    vals[i] = this.limMin[i];
                }
            }
            if (!this.useFullJacobian) {
                J = this.halfJacobian((vals));
            } else {
                J = this.fullJacobian((vals));
            }
            var pos = this.getPosition(vals);
            if (!this.useFullJacobian) {
                actual = [pos.x, pos.y, pos.z];
            } else {
                var euler = this.getEuler(vals);
                actual = [pos.x, pos.y, pos.z, euler.x, euler.y, euler.z];
            }

        }
        for (var i = 1; i <= this.numDOF; i++) {
            this['j' + i] = vals[i - 1];;
        }
    }

    this.values = [];
    for (var i = 1; i <= this.numDOF; i++) {
        this.values.push(this['j' + i]);
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
        var jointPos = VCP.extractPosition(this.globalTransMatrices[i]);
        this.jointPositions.push(jointPos);

    }
    this.endEffectorPosition = this.jointPositions[i - 1];
    this.endEffectorOrientation = (VCP.extractEuler(this.globalTransMatrices[i - 1]));


    if (this.controlMode !== VCP.CONTROLMODE.POSITION || (this.controlMode === VCP.CONTROLMODE.POSITION && !this.useFullJacobian)) {
        this.endPos.px = this.endEffectorPosition.x;
        this.endPos.py = this.endEffectorPosition.y;
        this.endPos.pz = this.endEffectorPosition.z;

        this.endPos.ox = this.endEffectorOrientation.x;
        this.endPos.oy = this.endEffectorOrientation.y;
        this.endPos.oz = this.endEffectorOrientation.z;
    }

};

VCP.Kine.prototype.draw = function () {
    for (var i = 1; i < this.length -1; i++) {
        var type = this.types[i + 1];
        var v1 = this.jointPositions[i];
        var v2 = this.jointPositions[i + 1];
        if (type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
            this.remove(this.linkMeshes[i]);
            var mesh = VCP.cylinderMesh(v1, v2, 0.1, VCP.BLUE);
            this.linkMeshes[i] = (mesh);
            this.add(mesh);
        } else {
            var distance = v1.distanceTo(v2);
            var position = v2.clone().add(v1).divideScalar(2);
            this.linkMeshes[i].position = position;
            this.linkMeshes[i].setRotationFromMatrix(this.globalTransMatrices[i]);
        }
    }


    for (var i = 0; i < this.length; i++) {

        var pos = this.jointPositions[i];
        var rot = this.globalTransMatrices[i];
        var type = this.types[i];


        this.XYZHelpers[i].position.copy(pos);
        this.XYZHelpers[i].setRotationFromMatrix(rot);

        var jointMesh = this.jointMeshes[i];
        jointMesh.position.copy(pos);
        jointMesh.setRotationFromMatrix(rot);

        if (type === 'PX' || type === 'RX') {
            jointMesh.rotateZ(Math.PI / 2);
        } else if (type === 'PZ' || type === 'RZ') {
            jointMesh.rotateX(Math.PI / 2);
        }

    }
    if (this.controlMode === VCP.CONTROLMODE.POSITION) {
        this.targetHelper.position.copy(new THREE.Vector3(this.endPos.px, this.endPos.py, this.endPos.pz));
    } else if (this.controlMode === VCP.CONTROLMODE.VELOCITY) {
        this.targetHelper.position.copy(new THREE.Vector3().copy(this.endEffectorPosition).add(new THREE.Vector3(this.endSpeed.vx, this.endSpeed.vy, this.endSpeed.vz)));
    } else if (this.controlMode === VCP.CONTROLMODE.DIRECT) {
        this.targetHelper.position.copy(this.endEffectorPosition);
    }
};

VCP.Kine.prototype.getPosition = function (values) {
    var vals = values.slice();
    var transMatrix;
    for (var i = 0; i < this.length; i++) {
        var mat = this.getTransformationMatrix(this.types[i], this.relativePositions[i], vals);
        if (i === 0) {
            transMatrix = mat;
        } else {
            transMatrix = transMatrix.multiply(mat);
        }
    }

    return VCP.extractPosition(transMatrix);

};

VCP.Kine.prototype.getEuler = function (values) {
    var vals = values.slice();
    var transMatrix;
    for (var i = 0; i < this.length; i++) {
        var mat = this.getTransformationMatrix(this.types[i], this.relativePositions[i], vals);
        if (i === 0) {
            transMatrix = mat;
        } else {
            transMatrix = transMatrix.multiply(mat);
        }
    }

    return (VCP.extractEuler(transMatrix));

};

VCP.Kine.prototype.computeReach = function (h) {
    var equallySpacedJointValues = VCP.equallySpacedJointValues(this.limMin, this.limMax, h);

    var points = [];
    for (var i = 0; i < equallySpacedJointValues.length; i++) {
        points.push(this.getPosition((equallySpacedJointValues[i])));
    }
    this.boundingBox = new VCP.BoundingBox(points);

    // create the particle variables
    var particleCount = points.length;
    var particles = new THREE.Geometry();
    var pMaterial = new THREE.PointCloudMaterial({ color: VCP.RED, size: 0.2, transparent: true, opacity: 0.8 });


    // create the particle system
    for (var i = 0; i < points.length; i++) {
        particles.vertices.push(points[i]);
    }
    this.permut.add(new THREE.PointCloud(particles, pMaterial));

    var p = [];
    var particles = new THREE.Geometry();
    for (var i = 0; i < (particleCount / h) - h; i++) {
        p.push(points[i]);
    }
    var k = (particleCount / h) - h;
    for (var i = 0; i < h - 1; i++) {

        for (var j = 0; j < (h * 2) ; j++) {
            p.push(points[k + j]);
        }
        k += particleCount / h;
    }

    for (var i = particleCount - ((particleCount / h) + h) ; i < particleCount; i++) {
        p.push(points[i]);
    }

    var matrix = [];
    for (var j = 0; j < h; j++) {
        matrix.push([]);
        for (var i = j; i < p.length; i++) {
            matrix[j].push(p[i]);
            i = i + h - 1;
        }
        matrix[j].sort(function compare(a, b) {
            if (a.y < b.y)
                return -1;
            if (a.y > b.y)
                return 1;
            return 0;
        });
    }

    var trans = numeric.transpose(matrix);

    for (var i = 0; i < trans.length; i++) {
        var row = trans[i];
        var geom = new THREE.Geometry();
        for (var j = 0; j < row.length; j++) {
            geom.vertices.push(row[j]);
        }
        var line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: VCP.BLUE, transparent: true, opacity: 0.5 }));
        this.permutBoundary.add(line);

    }

    // create the particle system
    for (var i = 0; i < p.length; i++) {
        particles.vertices.push(p[i]);
    }
    this.permutBoundary.add(new THREE.PointCloud(particles, pMaterial));

    var mat = new THREE.MeshBasicMaterial({ color: VCP.BLUE, wireframe: true, transparent: true, opacity: 0.5 });
    var conv = new THREE.ConvexGeometry(this.randomPositions(3000 * this.numDOF));
    this.convex.add(new THREE.Mesh(conv, mat));
};

VCP.Kine.prototype.halfJacobian = function (values) {
    var h = 0.0001;

    var rows = 3;
    var cols = this.numDOF;
    var jacobian = new Array(rows);
    for (var i = 0; i < rows; i++) {
        jacobian[i] = new Array(cols);
    }

    for (var i = 0; i < cols; i++) {
        var vals = values.slice();
        vals[i] = vals[i] + h;
        var d1 = this.getPosition((vals));
        var d2 = this.getPosition((values));

        jacobian[0][i] = (d1.x - d2.x) / h;
        jacobian[1][i] = (d1.y - d2.y) / h;
        jacobian[2][i] = (d1.z - d2.z) / h;
    }

    return jacobian;
};

VCP.Kine.prototype.fullJacobian = function (values) {
    var h = 0.0001;

    var rows = 6;
    var cols = this.numDOF;
    var jacobian = new Array(rows);
    for (var i = 0; i < rows; i++) {
        jacobian[i] = new Array(cols);
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

VCP.Kine.prototype.randomPositions = function (howMany) {
    howMany = howMany || 5000;

    var randomJointValues = VCP.randomJointValues(this.limMin, this.limMax, howMany);
    var randomPositions = [];
    for (var i = 0; i < randomJointValues.length; i++) {
        randomPositions.push(this.getPosition(randomJointValues[i]));
    }

    return randomPositions;
};

VCP.Kine.prototype.updateGUI = function (gui) {
    var kineFolder = gui.addFolder('Kine');

    var jointFolder = kineFolder.addFolder('Joint values');
    for (var i = 1; i <= this.numDOF; i++) {
        var j = 'j' + i;
        var joint = jointFolder.add(this, j, this.limMin[i - 1], this.limMax[i - 1]); joint.listen(); joint.onChange(this.setDirectMode);
    }
    jointFolder.open();

    var velocityFolder = kineFolder.addFolder("End-effector velocity");
    velocityFolder.add(this, 'velSolver', VCP.SOLVER);
    var vx = velocityFolder.add(this.endSpeed, 'vx', -10, 10); vx.listen(); vx.onChange(this.setVelocityMode);
    var vy = velocityFolder.add(this.endSpeed, 'vy', -10, 10); vy.listen(); vy.onChange(this.setVelocityMode);
    var vz = velocityFolder.add(this.endSpeed, 'vz', -10, 10); vz.listen(); vz.onChange(this.setVelocityMode);

    var positionFolder = kineFolder.addFolder("End-effector position");
    positionFolder.add(this, 'posSolver', VCP.SOLVER);
    positionFolder.add(this, 'useFullJacobian');
    positionFolder.add(this, 'lambda', 0.01, 1);
    var px = positionFolder.add(this.endPos, 'px', this.boundingBox.min.x, this.boundingBox.max.x); px.listen(); px.onChange(this.setPositionMode);
    var py = positionFolder.add(this.endPos, 'py', this.boundingBox.min.y, this.boundingBox.max.y); py.listen(); py.onChange(this.setPositionMode);
    var pz = positionFolder.add(this.endPos, 'pz', this.boundingBox.min.z, this.boundingBox.max.z); pz.listen(); pz.onChange(this.setPositionMode);
    var ox = positionFolder.add(this.endPos, 'ox', -180, 180); ox.listen(); ox.onChange(this.setPositionMode);
    var oy = positionFolder.add(this.endPos, 'oy', -180, 180); oy.listen(); oy.onChange(this.setPositionMode);
    var oz = positionFolder.add(this.endPos, 'oz', -180, 180); oz.listen(); oz.onChange(this.setPositionMode);

    var visualizationFolder = kineFolder.addFolder('Visualization params');
    visualizationFolder.add(this, 'workspace', VCP.WORKSPACE).onChange(this.toggleWorkspaceVisibility);
    visualizationFolder.add(this, 'showWorkspace').onChange(this.toggleWorkspaceVisibility);
    visualizationFolder.add(this, 'showBoundingBox').onChange(this.toggleBoundingBoxVisibility);
    visualizationFolder.add(this, 'showXYZ').onChange(this.toggleXYZVisibility);
    visualizationFolder.add(this, 'showTarget').onChange(this.toggleTargetVisibility);
    visualizationFolder.open();

    kineFolder.open();
};

VCP.Kine.prototype.arrayToRadians = function (values) {
    var vals = values.slice();
    var converted = [];
    for (var i = 0; i < this.length; i++) {

        var type = this.types[i];
        if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ || type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
            var j = 0;
            if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ) {
                j = THREE.Math.degToRad(vals.splice(0, 1)[0]);
            } else {
                j = vals.splice(0, 1)[0];
            }
            converted.push(j);
        }
    }
    return converted;
};

VCP.Kine.prototype.arrayToDegrees = function (values) {
    var vals = values.slice();
    var converted = [];
    for (var i = 0; i < this.length; i++) {

        var type = this.types[i];
        if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ || type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
            var j = 0;
            if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ) {
                j = THREE.Math.radToDeg(vals.splice(0, 1)[0]);
            } else {
                j = vals.splice(0, 1)[0];
            }
            converted.push(j);
        }
    }
    return converted;
};

VCP.Kine.prototype.getTransformationMatrix = function (type, p, values) {
    var j = 0;
    if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ || type === VCP.JOINTTYPES.PX || type === VCP.JOINTTYPES.PY || type === VCP.JOINTTYPES.PZ) {
        if (type === VCP.JOINTTYPES.RX || type === VCP.JOINTTYPES.RY || type === VCP.JOINTTYPES.RZ) {
            j = THREE.Math.degToRad(values.splice(0, 1)[0]);
        } else {
            j = values.splice(0, 1)[0];
        }
    }
    var trans;

    if (type === VCP.JOINTTYPES.RX) {
        trans = new THREE.Matrix4().makeRotationX(j);
    } else if (type === VCP.JOINTTYPES.RY) {
        trans = new THREE.Matrix4().makeRotationY(j);
    } else if (type === VCP.JOINTTYPES.RZ) {
        trans = new THREE.Matrix4().makeRotationZ(j);
    } else if (type === VCP.JOINTTYPES.PX) {
        trans = new THREE.Matrix4().makeTranslation(j, 0, 0);
    } else if (type === VCP.JOINTTYPES.PY) {
        trans = new THREE.Matrix4().makeTranslation(0, j, 0);
    } else if (type === VCP.JOINTTYPES.RZ) {
        trans = new THREE.Matrix4().makeTranslation(0, 0, j);
    } else {
        trans = new THREE.Matrix4().identity();
    }
    var result = new THREE.Matrix4().makeTranslation(p.x, p.y, p.z).multiply(trans);

    return result;

};

/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/