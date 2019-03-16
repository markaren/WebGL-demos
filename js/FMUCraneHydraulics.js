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

VCP.FMUCraneHydraulics = function(mesh) {
	THREE.Object3D.call(this);
	this.mesh = mesh; 
	this.add(mesh);
	
	this.gain = {
		g1:0,
		g2:0,
		g3:0
	};
	
	this.jointValues = {
        j1: 0.0,
        j2: 0.0,
        j3: 0.0,
    };

	var that = this;
	this.ws1 = new WebSocket("ws://localhost:8888/ws");
	this.ws2 = new WebSocket("ws://localhost:8888/ws");
	this.ws3 = new WebSocket("ws://localhost:8888/ws");

    this.ws1.onopen = function () {
		that.ws1.send(JSON.stringify({ 'model': 'C:\\GITRepo\\GitHub\\mechlab\\fmuWebsocketServer\\HydraulicMotor.fmu 0 100 0.01' }));
        that.ws1.send(JSON.stringify({ 'outputs': 'Integrate1.t1' }));
		that.ws1.send('start');
	};
	
	this.ws2.onopen = function () {
		that.ws2.send(JSON.stringify({ 'model': 'C:\\GITRepo\\GitHub\\mechlab\\fmuWebsocketServer\\HydraulicCylinder.fmu 0 100 0.01' }));
        that.ws2.send(JSON.stringify({ 'outputs': 'Integrate.t2' }));
		that.ws2.send('start');
	};
	
	this.ws3.onopen = function () {
		that.ws3.send(JSON.stringify({ 'model': 'C:\\GITRepo\\GitHub\\mechlab\\fmuWebsocketServer\\HydraulicCylinder.fmu 0 100 0.01' }));
        that.ws3.send(JSON.stringify({ 'outputs': 'Integrate.t3' }));
		that.ws3.send('start');
	};


    this.ws1.onmessage = function (evt) {
		 var message = evt.data;
		 try {
            var obj = JSON.parse(evt.data);
			var j1 = (obj['Integrate1.t1']);
			that.jointValues.j1 = THREE.Math.radToDeg(j1);
        } catch (err) {
            console.log(message);
        }
	};
	
	this.ws2.onmessage = function (evt) {
		 var message = evt.data;
		 try {
            var obj = JSON.parse(evt.data);
			var j2 = (obj['Integrate.t2']);
            that.jointValues.j2 = THREE.Math.radToDeg(j2-0.11)-80;
        } catch (err) {
            console.log(message);
        }
	};
	
	this.ws3.onmessage = function (evt) {
		 var message = evt.data;
		 try {
            var obj = JSON.parse(evt.data);
			var j3 = (obj['Integrate.t3']);
            that.jointValues.j3 = THREE.Math.radToDeg(j3-0.128)-125;
        } catch (err) {
            console.log(message);
        }
	};

    this.ws1.onclose = function (evt) {
        console.log("Connection close");
    };
	
	this.ws2.onclose = function (evt) {
        console.log("Connection close");
    };
	
	this.ws3.onclose = function (evt) {
        console.log("Connection close");
    };

	this.onGainChange = function(value) {
		if (that.ws1) {
			if (that.ws1.readyState === 1) {
				that.ws1.send(JSON.stringify({'gain':that.gain.g1}));
			}
		}
		if (that.ws2) {
			if (that.ws2.readyState === 1) {
				that.ws2.send(JSON.stringify({'gain':that.gain.g2}));
			}
		}
		if (that.ws3) {
			if (that.ws3.readyState === 1) {
				that.ws3.send(JSON.stringify({'gain':that.gain.g3}));
			}
		}
	};
};

VCP.FMUCraneHydraulics.prototype = Object.create(THREE.Object3D.prototype);



VCP.FMUCraneHydraulics.prototype.updateGUI = function(gui) {
	var craneFolder = gui.addFolder('Crane');
	
	var gainFolder = craneFolder.addFolder('Cylinder gains');
	var g1 = gainFolder.add(this.gain, 'g1', -1, 1); g1.onChange(this.onGainChange);
	var g2 = gainFolder.add(this.gain, 'g2', -1, 1); g2.onChange(this.onGainChange);
	var g3 = gainFolder.add(this.gain, 'g3', -1, 1); g3.onChange(this.onGainChange);
	gainFolder.open();
	
	var jointFolder = craneFolder.addFolder('Joint values');
	var j1 = jointFolder.add(this.jointValues, 'j1', -180, 180); j1.listen();
	var j2 = jointFolder.add(this.jointValues, 'j2', -180, 180); j2.listen();
	var j3 = jointFolder.add(this.jointValues, 'j3', -180, 180); j3.listen();
	jointFolder.open();
	
	craneFolder.open();
};

VCP.FMUCraneHydraulics.prototype.update = function() {
	if (this.ws1) {
		if (this.ws1.readyState === 1) {
			this.ws1.send('get');
		}
	}
	if (this.ws2) {
		if (this.ws2.readyState === 1) {
			this.ws2.send('get');
		}
	}
	if (this.ws3) {
		if (this.ws3.readyState === 1) {
			this.ws3.send('get');
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
		callback(new VCP.FMUCraneHydraulics(crane));
    });
};


