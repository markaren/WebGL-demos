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
/*##################### BoundingBox  #################*/
/*####################################################*/
VCP.BoundingBox = function (min, max, color) {
    THREE.Object3D.call(this);

    this.min = min || new THREE.Vector3();
    this.max = max || new THREE.Vector3();
    this.color = color || VCP.BLUE;
    this.width = Math.abs(this.min.x - this.max.x);
    this.height = Math.abs(this.min.y - this.max.y);
    this.depth = Math.abs(this.min.z - this.max.z);
    this.center = new THREE.Vector3(this.max.x - (this.width / 2), this.max.y - (this.height / 2), this.max.z - (this.depth / 2));
    this.volume = this.width * this.depth * this.height;
    var tmp = this.width;
    if (tmp < this.height) {
        tmp = this.height;
    }
    if (tmp < this.depth) {
        tmp = this.depth;
    }
    this.maxValue = tmp;


    var material = new THREE.LineBasicMaterial({ color: this.color });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(this.min.x, this.min.y, this.min.z),
        new THREE.Vector3(this.min.x, this.min.y, this.max.z),
        new THREE.Vector3(this.max.x, this.min.y, this.max.z),
        new THREE.Vector3(this.max.x, this.min.y, this.min.z),
        new THREE.Vector3(this.min.x, this.min.y, this.min.z),
        new THREE.Vector3(this.min.x, this.max.y, this.min.z),
        new THREE.Vector3(this.min.x, this.max.y, this.max.z),
        new THREE.Vector3(this.min.x, this.min.y, this.max.z),
        new THREE.Vector3(this.min.x, this.max.y, this.max.z),
        new THREE.Vector3(this.max.x, this.max.y, this.max.z),
        new THREE.Vector3(this.max.x, this.min.y, this.max.z),
        new THREE.Vector3(this.max.x, this.max.y, this.max.z),
        new THREE.Vector3(this.max.x, this.max.y, this.min.z),
        new THREE.Vector3(this.max.x, this.min.y, this.min.z),
        new THREE.Vector3(this.max.x, this.max.y, this.min.z),
        new THREE.Vector3(this.min.x, this.max.y, this.min.z));
    this.line = new THREE.Line(geometry, material);

    this.add(this.line);
};

VCP.BoundingBox.prototype = Object.create(THREE.Object3D.prototype);


/*####################################################*/
/*##################### computeBoundingBox  ##########*/
/*####################################################*/
VCP.computeBoundingBox = function (points) {
    var xmin, xmax, ymin, ymax, zmin, zmax;

    for (var i = 0; i < points.length; i++) {
        var pos = points[i];
        var x = pos.x; var y = pos.y; var z = pos.z;
        if (i === 0) {
            xmin = xmax = x;
            ymin = ymax = y;
            zmin = zmax = z;
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
            } else if (zmax < z) {
                zmax = z;
            }
        }
    }
    return new VCP.BoundingBox(new THREE.Vector3(xmin, ymin, zmin), new THREE.Vector3(xmax, ymax, zmax));
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/