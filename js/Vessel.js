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
/*##################### VESSEL  ######################*/
/*####################################################*/
VCP.Vessel = function (mesh) {
    THREE.Object3D.call(this);
    this.mesh = mesh;
    this.add(mesh);

    this.rotY = 45;

    this.showOrigin = false;
    this.originHelper = new VCP.TransformHelper(100, 0.5, 0.5);

    this.rayOrigin = new THREE.Object3D();
    this.rayOrigin1 = new THREE.Object3D();
    this.rayOrigin2 = new THREE.Object3D();
    this.rayOrigin3 = new THREE.Object3D();

    var that = this;
    this.toggleOriginVisibility = function (value) {
        if (value) {
            that.add(that.originHelper);
        } else {
            that.remove(that.originHelper);
        }
    }
};

VCP.Vessel.prototype = Object.create(THREE.Object3D.prototype);

VCP.Vessel.prototype.updateGUI = function (gui) {
    var vesselParams = gui.addFolder('Vessel parameters');
    vesselParams.add(this, 'rotY', -180, 180);
    vesselParams.add(this, 'showOrigin').onChange(this.toggleOriginVisibility);
}

VCP.Vessel.prototype.update = function (oceanMesh) {

    var raycaster = new THREE.Raycaster(new THREE.Vector3(0, 1000, 0), new THREE.Vector3(0, -1, 0));
    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObject(oceanMesh);
    if (intersects.length > 0) {
        this.rayOrigin.position.set(0, 0, 0);
        this.rayOrigin.lookAt(intersects[0].face.normal);
        this.rayOrigin.position.copy(intersects[0].point);
        this.rayOrigin.translateY(-2);
    }


    var raycaster = new THREE.Raycaster(new THREE.Vector3(0, 1000, 80), new THREE.Vector3(0, -1, 0));
    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObject(oceanMesh);
    if (intersects.length > 0) {
        this.rayOrigin1.position.set(0, 0, 0);
        this.rayOrigin1.lookAt(intersects[0].face.normal);
        this.rayOrigin1.position.copy(intersects[0].point);
        this.rayOrigin1.translateY(-2);
    }

    var raycaster = new THREE.Raycaster(new THREE.Vector3(-10, 1000, 40), new THREE.Vector3(0, -1, 0));
    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObject(oceanMesh);
    if (intersects.length > 0) {
        this.rayOrigin2.position.set(0, 0, 0);
        this.rayOrigin2.lookAt(intersects[0].face.normal);
        this.rayOrigin2.position.copy(intersects[0].point);
        this.rayOrigin2.translateY(-2);
    }

    var raycaster = new THREE.Raycaster(new THREE.Vector3(10, 1000, 40), new THREE.Vector3(0, -1, 0));
    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObject(oceanMesh);
    if (intersects.length > 0) {
        this.rayOrigin3.position.set(0, 0, 0);
        this.rayOrigin3.lookAt(intersects[0].face.normal);
        this.rayOrigin3.position.copy(intersects[0].point);
        this.rayOrigin3.translateY(-2);
    }

    this.position.copy(this.rayOrigin.position);
    this.lookAt(this.rayOrigin1.position);
    this.translateY(-4);
    this.rayOrigin2.lookAt(this.rayOrigin3.position);
    this.rotateZ(-this.rayOrigin2.rotation.y);
    this.rotateZ(Math.PI / 2);
    this.rotateY(THREE.Math.degToRad(this.rotY));
};

/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/



/*####################################################*/
/*##################### LOADVESSEL  ###################*/
/*####################################################*/
VCP.LoadVessel = function (callback) {
    var loader = new THREE.STLLoader();
    loader.addEventListener('load', function (event) {

        var geometry = event.content;
        var material = new THREE.MeshPhongMaterial({ ambient: 0xC9B9A8, color: 0xe0e0e0, specular: 0x111111, shininess: 200 });
        var vessel = new THREE.Mesh(geometry, material);
        vessel.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        vessel.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
        vessel.castShadow = true;
        vessel.receiveShadow = true;

        callback(new VCP.Vessel(vessel));
    });
    loader.load('models/Isbryter.stl');
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/
