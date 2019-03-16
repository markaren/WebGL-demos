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

'use strict';

VCP.FMUCraneControl = function(mesh) {
	THREE.Object3D.call(this);
	this.mesh = mesh; 
	this.add(mesh);
	this.endVel = {
		vx:0,
		vy:0,
		vz:0
	};
	
	this.jointValues = {
        j1: 0.0,
        j2: 0.0,
        j3: 0.0,
    };

	var that = this;
	this.ws = new WebSocket("ws://localhost:8888/ws");
	this.ws.onopen = function() {
		//ws.send("listmodels");
		that.ws.send(JSON.stringify({'model':'C:\\GITRepo\\GitHub\\mechlab\\fmuWebsocketServer\\Controller.fmu 0 50 0.01'}));
		that.ws.send('listvariables');
		that.ws.send(JSON.stringify({'outputs':'t1 t2 t3 px py pz'}));
	};

	this.ws.onmessage = function (evt) {
		var message = evt.data;
		try {
			var json = JSON.parse(message);
			that.jointValues.j1 = THREE.Math.radToDeg(json.t1);
			that.jointValues.j2 = THREE.Math.radToDeg(-json.t2);
			that.jointValues.j3 = THREE.Math.radToDeg(-json.t3);
		} catch (err) {
			console.log(err);
		}
	};

	this.ws.onclose = function () {
		console.log("### Closed ####");
	};

	this.onVelChange = function(value) {
		if (that.ws) {
			if (that.ws.readyState === 1) {
				that.ws.send(JSON.stringify({'vx_joystick':that.endVel.vx, 'vy_joystick':that.endVel.vy,'vz_joystick':that.endVel.vz}));
			}
		}
	}
	
	
	
};

VCP.FMUCrane.prototype = Object.create(THREE.Object3D.prototype);



VCP.FMUCrane.prototype.updateGUI = function(gui) {
	var craneFolder = gui.addFolder('Crane');
	
	var velFolder = craneFolder.addFolder('End-Effector velocity');
	var vx = velFolder.add(this.endVel, 'vx', -1, 1); vx.onChange(this.onVelChange);
	var vy = velFolder.add(this.endVel, 'vy', -1, 1); vy.onChange(this.onVelChange);
	var vz = velFolder.add(this.endVel, 'vz', -1, 1); vz.onChange(this.onVelChange);
	velFolder.open();
	
	var jointFolder = craneFolder.addFolder('Joint values');
	var j1 = jointFolder.add(this.jointValues, 'j1', -180, 180); j1.listen();
	var j2 = jointFolder.add(this.jointValues, 'j2', -180, 180); j2.listen();
	var j3 = jointFolder.add(this.jointValues, 'j3', -180, 180); j3.listen();
	jointFolder.open();
	
	craneFolder.open();
};

VCP.FMUCrane.prototype.update = function() {
	if (this.ws) {
		if (this.ws.readyState === 1) {
			this.ws.send('get');
		}
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

    a4.position.copy(pos4); a4.setRotationFromMatrix(T05); a4.lookAt(pos5); a4.rotateY(Math.PI); a4.rotateZ(Math.PI / 2);
    a5.position.copy(pos5); a5.setRotationFromMatrix(T06); a5.lookAt(pos4); a5.rotateZ(Math.PI / 2);

    a6.position.copy(pos6); a6.setRotationFromMatrix(T07); a6.lookAt(pos7); a6.rotateY(Math.PI); a6.rotateZ(Math.PI / 2);
    a7.position.copy(pos7); a7.setRotationFromMatrix(T08); a7.lookAt(pos6); a7.rotateZ(Math.PI / 2);
	
};

VCP.LoadCrane = function(callback) {
	var loader = new THREE.ColladaLoader();
	//loader.options.convertUpAxis = true;
    loader.load('models/Crane.dae', function (collada) {
        var crane = collada.scene;
		//crane.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI).multiply(new THREE.Matrix4().makeRotationY(Math.PI/2)));
		callback(new VCP.FMUCrane(crane));
    });
};










