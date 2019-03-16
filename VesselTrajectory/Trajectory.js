
function Trajectory(onReady) {
    
    var that = this;
    
    this.t = 0;
    this.counter = 0;
    
    this.positions = [];
    this.quaternions = [];
    

    var readTextFile = function(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4) {
                if(rawFile.status === 200 || rawFile.status == 0) {
                    callback(rawFile.responseText);
                }
            }
        }
        rawFile.send(null);
    }
    
    
    readTextFile("data/position2.txt", function(data) {
        
        var lines = data.split("\n");
        for (var i = 0; i < lines.length-1; i++) {
            var line = lines[i];
            var split = line.split("\t");
            var x = parseFloat(split[1]);
            var z = parseFloat(split[2]);
            
            var v = new THREE.Vector3(x*100, -10, z*100);
            
            that.positions.push(v);
        }
        
        onReady(that.positions);

    });
    
     readTextFile("data/quaternion2.txt", function(data) {
        
        var lines = data.split("\n");
        for (var i = 0; i < lines.length-1; i++) {
            var line = lines[i];
            var split = line.split("\t");
            var x = parseFloat(split[1]);
            var w = parseFloat(split[4]);
            
            var q = new THREE.Quaternion2(0, x, 0, w);
            that.quaternions.push(q);
        }

    });
    
   
}

Trajectory.prototype.next = function() {
    
     
   if (this.counter < this.positions.length-1) {
        this.counter++;    
    } else {
        this.counter = 0;    
    }
 
   return [this.positions[this.counter], this.quaternions[this.counter]]; 
    
    
   
    
}


Trajectory.prototype.update = function(obj) {
    
    var c = this.counter;
  
    var p = this.positions[c];
    var q = this.quaternions[c];
     
    obj.position.copy(p);
    obj.quaternion.copy(q);
    obj.rotateOnAxis(new THREE.Vector3(0,1,0), -Math.PI/2);
    
    if (c < this.positions.length-1) {
        this.counter++;    
    } else {
        this.counter = 0;    
    }

};


