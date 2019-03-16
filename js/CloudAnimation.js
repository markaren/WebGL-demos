/**
The MIT License (MIT)

Copyright (c) 2014 Lars Ivar Hatledal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
**/


THREE.CloudAnimation = function(particleSize) {

	THREE.Object3D.call(this);
	this.particleSize = particleSize || 0.01;
	
	this.lastPointer = 0;
	this.currentPointer = 0;
	
	
	this.clock = new THREE.Clock();
	this.loaded = false;
};

THREE.CloudAnimation.prototype = Object.create(THREE.Object3D.prototype);


THREE.CloudAnimation.prototype.load = function(evt, callback) {
	var that = this;
	var f = evt.target.files[0];
	if (f) {
		var r = new FileReader();
		r.onload = (function (f) {
			return function (e) {
				var zip = new JSZip(e.target.result);
				for (var key in zip.files) {
					if (zip.files.hasOwnProperty(key)) {
						var contents = zip.file(key).asText();
						if (contents) {
							var lines = contents.split("\n");		
							var num =  parseInt(lines[2].split(" ")[2]);
							var colors = [];
							var particles = new THREE.Geometry();

							for (var k = 0; k < num; k++) {
								var data = lines[k+10].split(" ");
								var vertex = new THREE.Vector3(parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2]));
								particles.vertices.push(vertex);
												
								var r = parseInt(data[3]); 
								var g = parseInt(data[4]); 
								var b = parseInt(data[5]); 
								colors[k] = new THREE.Color("rgb("+ r + ", " + g + ", " + b + ")" );
							}
							particles.colors = colors;
							var material = new THREE.PointCloudMaterial( { size: that.particleSize, vertexColors: THREE.VertexColors, transparent: true } );
							var mesh = new THREE.PointCloud(particles, material);
							//mesh.rotateY(Math.PI);
							mesh.visible = false;
							that.add(mesh);
						}
					} 
				}
				that.loaded = true;
				callback(that);
			};
		})(f);
		r.readAsArrayBuffer(f);
	}
};

THREE.CloudAnimation.prototype.update = function(updateInterval) {
	if (this.loaded) {
		var t = this.clock.getElapsedTime();
		if (t > updateInterval) {
			
			this.clock = new THREE.Clock(true);
		
			this.children[this.lastPointer].visible = false;
			this.children[this.currentPointer].visible = true;
			
			this.lastPointer = this.currentPointer;
			if (this.currentPointer < this.children.length-1) {
				this.currentPointer++;
			} else {
				this.currentPointer = 0;
			}
		}
	}
};
