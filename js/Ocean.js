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
/*##################### OCEAN  #######################*/
/*####################################################*/
VCP.Ocean = function (width, height, widthSegments, heightSegments) {
    THREE.Object3D.call(this);
    this.width = width || 3000;
    this.height = height || 3000;
    this.widthSegments = widthSegments || 100;
    this.heightSegments = heightSegments || 100;

    this.amplitude = 10;
    this.frequency = 0.1;
    this.waveMultiplier = 10;

    this.waveHeightA = 10;
    this.waveSpeedA = 7.1;
    this.waveOffsetA = 1.2834448552536923;

    var waterNormals = new THREE.ImageUtils.loadTexture('three/examples/textures/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    this.directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    this.directionalLight.position.set(-1, 0.4, -1);
    this.add(this.directionalLight);

    this.water = new THREE.Water(renderer, camera, scene, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha: 0.9,
        sunDirection: this.directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 50.0,
    });

    this.oceanGeom = new THREE.PlaneGeometry(this.width, this.height, this.widthSegments, this.heightSegments);
    this.oceanGeom.dynamic = true;
    this.oceanGeom.computeFaceNormals();

    this.oceanMesh = new THREE.Mesh(this.oceanGeom, this.water.material);

    this.oceanMesh.add(this.water);
    this.oceanMesh.rotateX(-Math.PI / 2);
    this.add(this.oceanMesh);
};

VCP.Ocean.prototype = Object.create(THREE.Object3D.prototype);

VCP.Ocean.prototype.updateGUI = function (gui) {
    var oceanParams = gui.addFolder('Ocean parameters');
    oceanParams.add(this, 'amplitude', 0, 30);
    oceanParams.add(this, 'frequency', 0.05, 0.25);
    oceanParams.add(this, 'waveMultiplier', 5, 20);
    oceanParams.open();
}

VCP.Ocean.prototype.update = function (t) {
    var normUtil = new VCP.NormUtil(this.oceanGeom.vertices.length * 3, 0, Math.PI * this.waveMultiplier, -Math.PI * this.waveMultiplier);
    for (var i = 0, l = this.oceanGeom.vertices.length; i < l; i++) {
        var vertex = this.oceanGeom.vertices[i];
        var y_t = this.amplitude * Math.sin(2 * Math.PI * this.frequency * t + normUtil.normalize(i));
        vertex.z = y_t;

    }
    // for (var i = 0, l = this.oceanGeom.vertices.length; i < l; i++) {
    //     var vertex = this.oceanGeom.vertices[i];
    //    vertex.z = Math.sin((vertex.x / 20) * this.waveOffsetA + (t / this.waveSpeedA)) * Math.cos((vertex.y / 20) * this.waveOffsetA + (t / this.waveSpeedA)) * this.waveHeightA;
    // }

    this.oceanMesh.geometry.verticesNeedUpdate = true;
    this.oceanGeom.computeFaceNormals();

    this.water.material.uniforms.time.value += 1.0 / 60.0;
    this.water.render();
}
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/