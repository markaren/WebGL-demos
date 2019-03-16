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

/*####################################################*/
/*##################### CRANE  #######################*/
/*####################################################*/
VCP.Crane = function (mesh) {
    THREE.Object3D.call(this);

    this.mesh = mesh;
    this.add(mesh);
    this.permut = new THREE.Object3D();
    this.permutBoundary = new THREE.Object3D();
    this.convex = new THREE.Object3D();
    this.gridPoints = new THREE.Object3D();
	this.gridBoxes = new THREE.Object3D();
    this.originHelper = new VCP.TransformHelper(10, 0.5, 0.5);
    this.targetHelper = new VCP.TransformHelper(10, 0.5, 0.5);

    this.showOrigin = false;
    this.showTarget = false;
    this.showBoundingBox = false;
    this.showWorkspace = false;

    this.controlMode = VCP.CONTROLMODE.DIRECT;
    this.velSolver = VCP.SOLVER.PINV;
    this.posSolver = VCP.SOLVER.DLS;

    this.limMin = [-145, -80, -125];
    this.limMax = [145, 0, -10];

    this.payloadMass = 1000; //kg
    this.torques;
    

    this.boundingBox;
    this.workspaceVolume = 0.0;
    this.workspace = "1";

    this.jointValues = {
        j1: 0.0,
        j2: -40,
        j3: -67.5,
    };

    this.endSpeed = {
        vx: 0.0,
        vy: 0.0,
        vz: 0.0,
    };

    this.endPos = {
        px: 0.0,
        py: 0.0,
        pz: 0.0,
    };

    this.torqueStr = {
        t1: '0.0',
        t2: '0.0',
        t3: '0.0'
    };


    this.jacobian;
    this.endEffectorPosition;

    this.generateWorkspace(30);
    this.calculateGridWorkspace(50000, 25);

    var that = this;
    this.toggleWorkspaceVisibility = function (value) {
        if (that.showWorkspace) {
            if (that.workspace === "0") {
                that.remove(that.convex);
                that.remove(that.permutBoundary);
                that.remove(that.gridPoints);
				that.remove(that.gridBoxes);
                that.add(that.permut);
            } else if (that.workspace === "1") {
                that.remove(that.convex);
                that.remove(that.permut);
                that.remove(that.gridPoints);
				that.remove(that.gridBoxes);
                that.add(that.permutBoundary);
            } else if (that.workspace === "2") {
                that.remove(that.permutBoundary);
                that.remove(that.permut);
                that.remove(that.gridPoints);
				that.remove(that.gridBoxes);
                that.add(that.convex);
            } else if (that.workspace === "3") {
                that.remove(that.permutBoundary);
                that.remove(that.permut);
                that.remove(that.convex);
				that.remove(that.gridBoxes);
                that.add(that.gridPoints);
            } else if (that.workspace === "4") {
                that.remove(that.permutBoundary);
                that.remove(that.permut);
                that.remove(that.convex);
				that.remove(that.gridPoints);
                that.add(that.gridBoxes);
            }

        } else {
            that.remove(that.convex);
            that.remove(that.permut);
            that.remove(that.permutBoundary);
			that.remove(that.gridPoints);
            that.remove(that.gridBoxes);
        }
    }
    this.toggleBoundingBoxVisibility = function (value) {
        if (value) {
            that.add(that.boundingBox);
        } else {
            that.remove(that.boundingBox);
        }
    }
    this.toggleOriginVisibility = function (value) {
        if (value) {
            that.add(that.originHelper);
        } else {
            that.remove(that.originHelper);
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

VCP.Crane.prototype = Object.create(THREE.Object3D.prototype);

VCP.Crane.prototype.updateGUI = function (gui) {

    var craneFolder = gui.addFolder('Crane');

    var jointFolder = craneFolder.addFolder('Joint values');
    var j1 = jointFolder.add(this.jointValues, 'j1', crane.limMin[0], crane.limMax[0]); j1.listen(); j1.onChange(this.setDirectMode);
    var j2 = jointFolder.add(this.jointValues, 'j2', crane.limMin[1], crane.limMax[1]); j2.listen(); j2.onChange(this.setDirectMode);
    var j3 = jointFolder.add(this.jointValues, 'j3', crane.limMin[2], crane.limMax[2]); j3.listen(); j3.onChange(this.setDirectMode);
    jointFolder.open();

    var velocityFolder = craneFolder.addFolder("End-effector velocity");
    velocityFolder.add(this, 'velSolver', VCP.SOLVER).onChange(this.toggleWorkspaceVisibility());
    var vx = velocityFolder.add(this.endSpeed, 'vx', -10, 10); vx.listen(); vx.onChange(this.setVelocityMode);
    var vy = velocityFolder.add(this.endSpeed, 'vy', -10, 10); vy.listen(); vy.onChange(this.setVelocityMode);
    var vz = velocityFolder.add(this.endSpeed, 'vz', -10, 10); vz.listen(); vz.onChange(this.setVelocityMode);

    var positionFolder = craneFolder.addFolder("End-effector position");
    positionFolder.add(this, 'posSolver', VCP.SOLVER);
    var px = positionFolder.add(this.endPos, 'px', this.boundingBox.min.x, this.boundingBox.max.x); px.listen(); px.onChange(this.setPositionMode);
    var py = positionFolder.add(this.endPos, 'py', this.boundingBox.min.y, this.boundingBox.max.y); py.listen(); py.onChange(this.setPositionMode);
    var pz = positionFolder.add(this.endPos, 'pz', this.boundingBox.min.z, this.boundingBox.max.z); pz.listen(); pz.onChange(this.setPositionMode);

    var torqueFolder = craneFolder.addFolder('Torques');
    torqueFolder.add(this, 'payloadMass', 0, 2000);
    torqueFolder.add(this.torqueStr, 't1').listen();
    torqueFolder.add(this.torqueStr, 't2').listen();
    torqueFolder.add(this.torqueStr, 't3').listen();

    var visualizationFolder = craneFolder.addFolder('Visualization');
    visualizationFolder.add(this, 'workspace', VCP.WORKSPACE).onChange(this.toggleWorkspaceVisibility);
    visualizationFolder.add(this, 'showBoundingBox').onChange(this.toggleBoundingBoxVisibility);
    visualizationFolder.add(this, 'showWorkspace').onChange(this.toggleWorkspaceVisibility);
    visualizationFolder.add(this, 'showOrigin').onChange(this.toggleOriginVisibility);
    visualizationFolder.add(this, 'showTarget').onChange(this.toggleTargetVisibility);
    visualizationFolder.open();

    craneFolder.open();
}

VCP.Crane.prototype.update = function (delta) {

    if (this.controlMode === VCP.CONTROLMODE.VELOCITY) {
        var J = this.jacobian;
        var actual = this.endEffectorPosition;
        var desired = this.endEffectorPosition.clone().add((new THREE.Vector3(this.endSpeed.vx, this.endSpeed.vy, this.endSpeed.vz).multiplyScalar(delta)));
        var vals = [this.jointValues.j1, this.jointValues.j2, this.jointValues.j3];

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
                } else if (vals[i] < crane.limMin[i]) {
                    vals[i] = this.limMin[i];
                }
            }
            J = this.calculateJacobian(VCP.arrayToRadians(vals));
            actual = this.calculateEndEffectorPosition(VCP.arrayToRadians(vals));
        }
        this.jointValues.j1 = vals[0];
        this.jointValues.j2 = vals[1];
        this.jointValues.j3 = vals[2];
    } else if (this.controlMode === VCP.CONTROLMODE.POSITION) {
        var J = this.jacobian;
        var actual = this.endEffectorPosition;
        var desired = new THREE.Vector3(this.endPos.px, this.endPos.py, this.endPos.pz);
        var vals = [this.jointValues.j1, this.jointValues.j2, this.jointValues.j3];

        for (var j = 0; j < 100; j++) {

            var speeds = [desired.x - actual.x, desired.y - actual.y, desired.z - actual.z];
            var inv;
            if (this.posSolver === 'pinv') {
                inv = VCP.pinv(J);
            } else if (this.posSolver === 'dls') {
                inv = VCP.dls(J, 0.5);
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
            J = this.calculateJacobian(VCP.arrayToRadians(vals));
            actual = this.calculateEndEffectorPosition(VCP.arrayToRadians(vals));
        }
        this.jointValues.j1 = vals[0];
        this.jointValues.j2 = vals[1];
        this.jointValues.j3 = vals[2];
    }


    var values = VCP.arrayToRadians([(this.jointValues.j1), (this.jointValues.j2), (this.jointValues.j3)]);

    var t0 = new THREE.Matrix4().makeRotationX(-Math.PI / 2).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    var t1 = (new THREE.Matrix4().copy(t0).multiply(new THREE.Matrix4().makeRotationZ(values[0])));
    var t2 = new THREE.Matrix4().makeTranslation(0, 0, 2.563);
    var t3 = new THREE.Matrix4().makeRotationY(values[1]);
    var t4 = new THREE.Matrix4().makeTranslation(6.998, 0, 0.05).multiply(new THREE.Matrix4().makeRotationY(values[2]));
    var t5 = new THREE.Matrix4().makeTranslation(0.51, 0, 1.723);
    var t6 = new THREE.Matrix4().makeTranslation(1.4, 0, 0.15);
    var t7 = new THREE.Matrix4().makeTranslation(5.15, 0, -0.2);
    var t8 = new THREE.Matrix4().makeTranslation(-0.5, 0, -0.15);

    var T01 = new THREE.Matrix4().copy(t1);
    var T02 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var T03 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().copy(t3)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    var T04 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().copy(t3))
    .multiply(new THREE.Matrix4().copy(t4)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    var T05 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t5));
    var T06 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().copy(t3))
    .multiply(new THREE.Matrix4().copy(t6));
    var T07 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().copy(t3))
    .multiply(new THREE.Matrix4().copy(t7));
    var T08 = new THREE.Matrix4().copy(t1).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().copy(t3))
    .multiply(new THREE.Matrix4().copy(t4)).multiply(new THREE.Matrix4().copy(t8));

    var pos0 = VCP.extractPosition(T01); var pos1 = VCP.extractPosition(T02); var pos2 = VCP.extractPosition(T03);
    var pos3 = VCP.extractPosition(T04); var pos4 = VCP.extractPosition(T05); var pos5 = VCP.extractPosition(T06);
    var pos6 = VCP.extractPosition(T07); var pos7 = VCP.extractPosition(T08);

    var a0 = this.mesh.getObjectById('Actor0'); var a1 = this.mesh.getObjectById('Actor1'); var a2 = this.mesh.getObjectById('Actor2');
    var a3 = this.mesh.getObjectById('Actor3'); var a4 = this.mesh.getObjectById('Actor4'); var a5 = this.mesh.getObjectById('Actor5');
    var a6 = this.mesh.getObjectById('Actor7'); var a7 = this.mesh.getObjectById('Actor6');


    a0.position.copy(pos0); a0.setRotationFromMatrix(T01);
    a1.position.copy(pos1); a1.setRotationFromMatrix(T02);
    a2.position.copy(pos2); a2.setRotationFromMatrix(T03);
    a3.position.copy(pos3); a3.setRotationFromMatrix(T04);
	
	

	
    a4.position.copy(pos4);
	a4.setRotationFromMatrix(T05); a4.lookAt(pos5); a4.rotateY(Math.PI); a4.rotateZ(Math.PI / 2);
    a5.position.copy(pos5);
	a5.setRotationFromMatrix(T06); a5.lookAt(pos4); a5.rotateZ(Math.PI / 2);

    a6.position.copy(pos6);
	a6.setRotationFromMatrix(T07); a6.lookAt(pos7); a6.rotateY(Math.PI); a6.rotateZ(Math.PI / 2);
    a7.position.copy(pos7); 
	a7.setRotationFromMatrix(T08); a7.lookAt(pos6); a7.rotateZ(Math.PI / 2);


    this.endEffectorPosition = this.calculateEndEffectorPosition(values);
    this.jacobian = this.calculateJacobian(values);
    this.torques = this.calculateTorques(values, new THREE.Vector3(0, -9.81 * this.payloadMass, 0));
    this.torqueStr.t1 = this.torques[0].toPrecision(6);
    this.torqueStr.t2 = this.torques[1].toPrecision(6);
    this.torqueStr.t3 = this.torques[2].toPrecision(6);

    if (this.controlMode !== VCP.CONTROLMODE.POSITION) {
        this.endPos.px = this.endEffectorPosition.x;
        this.endPos.py = this.endEffectorPosition.y;
        this.endPos.pz = this.endEffectorPosition.z;
    }

    if (this.controlMode === VCP.CONTROLMODE.POSITION) {
        this.targetHelper.position.copy(new THREE.Vector3(this.endPos.px, this.endPos.py, this.endPos.pz));
    } else if (this.controlMode === VCP.CONTROLMODE.VELOCITY) {
        this.targetHelper.position.copy(new THREE.Vector3().copy(this.endEffectorPosition).add(new THREE.Vector3(this.endSpeed.vx, this.endSpeed.vy, this.endSpeed.vz)));
    } else if (this.controlMode === VCP.CONTROLMODE.DIRECT) {
        this.targetHelper.position.copy(this.endEffectorPosition);
    }

};

VCP.Crane.prototype.calculateTorques = function (values, forces) {
    var jacobian = this.calculateJacobian(values);
    var jt = numeric.transpose(jacobian);

    return numeric.dot(jt, [forces.x, forces.y, forces.z]);

}

VCP.Crane.prototype.calculateEndEffectorPosition = function (values) {
    var t0 = new THREE.Matrix4().makeRotationX(-Math.PI / 2).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));;
    var t1 = new THREE.Matrix4().makeRotationZ(values[0]);
    var t2 = new THREE.Matrix4().makeTranslation(0, 0, 2.563 * 2).multiply(new THREE.Matrix4().makeRotationY(values[1]));
    var t3 = new THREE.Matrix4().makeTranslation(6.998 * 2, 0, 0).multiply(new THREE.Matrix4().makeRotationY(values[2]));
    var t4 = new THREE.Matrix4().makeTranslation((3.41 - 6.998) * 2, 0, -0.3 * 2);

    var T = new THREE.Matrix4().copy(t0).multiply(new THREE.Matrix4().copy(t1)).multiply(new THREE.Matrix4().copy(t2)).multiply(new THREE.Matrix4().copy(t3)).multiply(new THREE.Matrix4().copy(t4));
    var pos = new THREE.Vector3(T.elements[12], T.elements[13], T.elements[14]);

    return pos;
};

VCP.Crane.prototype.calculateJacobian = function (values) {
    var h = 0.0001;  //some low value

    var rows = 3;
    var cols = 3;
    var jacobian = new Array(rows);
    for (var i = 0; i < rows; i++) {
        jacobian[i] = new Array(cols);
    }

    for (var i = 0; i < cols; i++) {
        var vals = values.slice();
        vals[i] = vals[i] + h;
        var d1 = this.calculateEndEffectorPosition(vals);
        var d2 = this.calculateEndEffectorPosition(values);

        jacobian[0][i] = (d1.x - d2.x) / h;
        jacobian[1][i] = (d1.y - d2.y) / h;
        jacobian[2][i] = (d1.z - d2.z) / h;
    }
    return jacobian;
};

VCP.Crane.prototype.randomPositions = function (howMany) {
    var randValues = VCP.randomJointValues(this.limMin, this.limMax, howMany);

    var randPositions = [];
    for (var i = 0; i < randValues.length; i++) {
        randPositions.push(this.calculateEndEffectorPosition(VCP.arrayToRadians(randValues[i])));
    }
    return randPositions;
};

VCP.Crane.prototype.generateWorkspace = function (h) {
    var equallySpacedJointValues = VCP.equallySpacedJointValues(this.limMin, this.limMax, h);

    var points = [];
    for (var i = 0; i < equallySpacedJointValues.length; i++) {
        points.push(this.calculateEndEffectorPosition(VCP.arrayToRadians(equallySpacedJointValues[i])));
    }
    this.boundingBox = VCP.computeBoundingBox(points);

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
    var conv = new THREE.ConvexGeometry(this.randomPositions(10000));
    this.convex.add(new THREE.Mesh(conv, mat));
};

VCP.Crane.prototype.calculateGridWorkspace = function(count, n) {

	var particles = new THREE.Geometry();
    var pMaterial = new THREE.PointCloudMaterial({ color: VCP.YELLOW, size: 0.5, transparent: true, opacity: 0.5 });

    var points = this.randomPositions(count);
    points.sort(function compare(a, b) {
        if (a.x < b.x)
            return -1;
        if (a.x > b.x)
            return 1;
        return 0;
    });

	 this.boundingBox = VCP.computeBoundingBox(points);
	
    var x = VCP.linspace(this.boundingBox.min.x, this.boundingBox.max.x, n);
    var y = VCP.linspace(this.boundingBox.min.y,  this.boundingBox.max.y, n);
    var z = VCP.linspace(this.boundingBox.min.z, this.boundingBox.max.z, n);

    
    var list = [];
    for (var i = 1; i <= n-1; i++) {
        list.push([]);
    }

    var j = 0;
    for (var i = 0; i < count; i++) {
        var xmin = x[j]; var xmax = x[j+1]; 
        var row = points[i];
        var val = row.x;
       // console.log(val + " " + xmax);
        if (xmin <= val && val <= xmax) {
            list[j].push(row);
        } else {
            if (j < list.length) {
                j += 1;
            }
        }
    }

	var boxes = new Array(n-1);
	for (var i = 0; i < boxes.length; i++) {
		boxes[i] = new Array(n-1);
		for (var j = 0; j < boxes.length; j++) {
			boxes[i][j] = new Array(n-1);
		}
	}
	
	var clock = new THREE.Clock();
	clock.start();
    for (var i = 0; i < n - 1; i++) {
        var list2 = list[i];
        for (var j = 0; j < n - 1; j++) {
            for (var k = 0; k < n - 1; k++) {
                var bb = new VCP.BoundingBox(new THREE.Vector3(x[i], y[j], z[k]), new THREE.Vector3(x[i+1], y[j+1], z[k+1]), VCP.BLUE);
				//console.log(bb.center.x + " " + bb.center.y + " " + bb.center.z);
                var show = false;
                for (var l = 0; l < list2.length; l++) {
                    var point = list2[l];

                    var xdist = Math.abs(point.x - bb.center.x);
                    var ydist = Math.abs(point.y - bb.center.y);
                    var zdist = Math.abs(point.z - bb.center.z);

                    var xok = xdist <= (bb.width / 2);
                    var yok = ydist <= (bb.height / 2);
                    var zok = zdist <= (bb.depth / 2);
					
                    if (xok && yok && zok) {
                        show = true;
                    }
                }
                if (show) {
                    //this.gridBoxes.add(bb);
					particles.vertices.push(bb.center);
                    this.workspaceVolume += bb.volume;
                } 
				boxes[i][j][k] = new VCP.GridBox(bb, show);
            }
        }
    }
	
    this.gridPoints.add(new THREE.PointCloud(particles, pMaterial));
    console.log("Workspace volume is approx. " + this.workspaceVolume + " m^3");
	
	//
	
	var particles = new THREE.Geometry();
    var pMaterial = new THREE.PointCloudMaterial({ color: VCP.BLUE, size: 0.5, transparent: false, opacity: 1 });
	
	for (var i = 0; i < boxes.length; i++) {
		for (var j = 0; j < boxes[i].length; j++) {
			
			for (var k = 0; k < boxes[i][j].length; k++) {
				var b =  boxes[i][j][k];
				var bb = b.bb
				if (b.activated) {
					var b1,b2;
					var show = false;
					if ((i-1) >= 0 && (i+1) < (n-1)) {
						b1 = boxes[i-1][j][k];
						b2 = boxes[i+1][j][k];
						if (!b1.activated || !b2.activated) {
							show = true;
						}
					} else {
						show = true;
					}
					
					//
					
					if ((j-1) >= 0 && (j+1) < (n-1)) {
						b1 = boxes[i][j-1][k];
						b2 = boxes[i][j+1][k];
						if (!b1.activated || !b2.activated) {
							show = true;
						}
					} else {
						show = true;
					}
					
					//
					
					if ((k-1) >= 0 && (k+1) < (n-1)) {
						b1 = boxes[i][j][k-1];
						b2 = boxes[i][j][k+1];
						if (!b1.activated || !b2.activated) {
							show = true;
						}
					} else {
						show = true;
					}
					
					if (show) {
						particles.vertices.push(bb.center);
						this.gridBoxes.add(bb);
					}
				}
			}
		}
	}
	console.log(clock.getElapsedTime());
	 this.gridPoints.add(new THREE.PointCloud(particles, pMaterial));
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

/*####################################################*/
/*##################### LOADCRANE  ###################*/
/*####################################################*/
VCP.LoadCrane = function (callback) {
    var loader = new THREE.ColladaLoader();
    loader.load('models/Crane.dae', function (collada) {
        var crane = collada.scene;
        crane.scale.set(2, 2, 2);
        crane.updateMatrix();

		callback(new VCP.Crane(crane));
    });
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/

