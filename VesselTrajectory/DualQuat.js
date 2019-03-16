
function DualQuat (real, dual) {
    
    this.real = real || new Quat(0, 0, 0, 1);
    this.dual = dual || new Quat(0, 0, 0, 0);
}

DualQuat.prototype = {
  
    constructor: DualQuat,
    
    real: new Quat(0, 0, 0, 1),
    dual: new Quat(0 ,0, 0, 0),
    
    
    identity: function() {
      
        this.real.set(0, 0, 0, 1);
        this.dual.set(0, 0, 0, 0);
        
        return this;
        
    },
        
    makeTranslation: function(x, y, z) {
        
        this.real.set(0, 0, 0, 1);
        this.dual.multiplyQuaternions(new Quat(x, y, z, 0), this.real).multiplyScalar( 0.5 );
        
        return this;
        
    },
        
    normalize: function() {
      
        var n = 1.0 / this.real.length();
        this.real.multiplyScalar( n );
        this.dual.multiplyScalar( n );
        
        return this;
        
    },
        
    conjugate: function() {
      
        this.real.conjugate();
        this.dual.conjugate();
        
        return this;
        
    },
        
    dot: function( dq) {
      
        return this.real.dot( dq.real );
        
    },
        
        
    multiplyScalar: function ( scalar ) {
      
        this.real.multiplyScalar ( scalar );
        this.dual.multiplyScalar ( scalar );
        
        return this;
        
    },
        
    multiply: function ( q ) {
        
        return this.multiplyDual ( this, q );
        
    },
        
    multiplyDual: function ( dq1, dq2 ) {
        
        dq1.normalize();
        dq2.normalize();
        
        this.real.multiplyQuaternions( dq1.real, dq2.real ).normalize();
        this.dual.multiplyQuaternions( dq1.real, dq2.dual ).add( new Quat().multiplyQuaternions( dq1.dual, dq2.real ));
        
        return this;
        
    },
        
    copy: function( dq ) {
        
        this.real.set( dq.real.x,  dq.real.y,  dq.real.z,  dq.real.w);
        this.dual.set( dq.dual.x,  dq.dual.y,  dq.dual.z,  dq.dual.w);
        
    },
        
    clone: function() {
        
        return new DualQuat(this.real.clone(), this.dual.clone());
    }
        
    
    
};


DualQuat.ScLERP = function(from, to, t) {

    var dot = from.real.dot( to.real );
    
    if (dot < 0) {
     
        to = to.clone().multiplyScalar( -1 );
        
    }
    
    var diff = new DualQuat().multiplyDual( from.clone().conjugate(), to );
    
    var vr = new THREE.Vector3(diff.real.x, diff.real.y, diff.real.z);
    var vd = new THREE.Vector3(diff.dual.x, diff.dual.y, diff.dual.z);
    
    var invr = 1.0 / Math.sqrt(vr.dot(vr));
    
    var angle = 2 * Math.acos( diff.real.w );
    var pitch = -2 * diff.dual.w * invr;
    var direction = vr.multiplyScalar(invr);
    var moment = vd.sub( direction.multiplyScalar( pitch ).multiplyScalar( diff.real.w ).multiplyScalar( 0.5 ) ).multiplyScalar( invr );
    
    angle *= t;
    pitch *= t;
    
    var sinAngle = Math.sin( 0.5 * angle );
    var cosAngle = Math.cos( 0.5 * angle );
    
    var v1 = new THREE.Vector3().copy(direction).multiplyScalar( sinAngle );
    var real = new Quat( v1.x, v1.y, v1.z, cosAngle );
    
    var v2 = new THREE.Vector3().addVectors(moment.multiplyScalar ( sinAngle ), direction.multiplyScalar( cosAngle ).multiplyScalar( 0.5 ).multiplyScalar( pitch ));
    var dual = new Quat ( v2.x, v2.y, v2.z, -pitch * 0.5 * sinAngle ); 
    
    
    return new DualQuat().multiplyDual(from, new DualQuat(real, dual));
    
};














