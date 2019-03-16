// File:src/math/Quaternion.js

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Quaternion2 = function ( x, y, z, w ) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._w = ( w !== undefined ) ? w : 1;

};

THREE.Quaternion2.prototype = {

	constructor: THREE.Quaternion2,

	_x: 0,_y: 0, _z: 0, _w: 0,

	get x () {

		return this._x;

	},

	set x ( value ) {

		this._x = value;
		this.onChangeCallback();

	},

	get y () {

		return this._y;

	},

	set y ( value ) {

		this._y = value;
		this.onChangeCallback();

	},

	get z () {

		return this._z;

	},

	set z ( value ) {

		this._z = value;
		this.onChangeCallback();

	},

	get w () {

		return this._w;

	},

	set w ( value ) {

		this._w = value;
		this.onChangeCallback();

	},

	set: function ( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this.onChangeCallback();

		return this;

	},

	copy: function ( quaternion ) {

		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;

		this.onChangeCallback();

		return this;

	},

	setFromEuler: function ( euler, update ) {

		if ( euler instanceof THREE.Euler === false ) {

			throw new Error( 'THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.' );
		}

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		var c1 = Math.cos( euler._x / 2 );
		var c2 = Math.cos( euler._y / 2 );
		var c3 = Math.cos( euler._z / 2 );
		var s1 = Math.sin( euler._x / 2 );
		var s2 = Math.sin( euler._y / 2 );
		var s3 = Math.sin( euler._z / 2 );

		if ( euler.order === 'XYZ' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'YXZ' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( euler.order === 'ZXY' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'ZYX' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( euler.order === 'YZX' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'XZY' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		}

		if ( update !== false ) this.onChangeCallback();

		return this;

	},

	setFromAxisAngle: function ( axis, angle ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		var halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this.onChangeCallback();

		return this;

	},

	setFromRotationMatrix: function ( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		var te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33,
			s;

		if ( trace > 0 ) {

			s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;

		} else {

			s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this.onChangeCallback();

		return this;

	},

	setFromUnitVectors: function () {

		// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

		// assumes direction vectors vFrom and vTo are normalized

		var v1, r;

		var EPS = 0.000001;

		return function ( vFrom, vTo ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			r = vFrom.dot( vTo ) + 1;

			if ( r < EPS ) {

				r = 0;

				if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

					v1.set( - vFrom.y, vFrom.x, 0 );

				} else {

					v1.set( 0, - vFrom.z, vFrom.y );

				}

			} else {

				v1.crossVectors( vFrom, vTo );

			}

			this._x = v1.x;
			this._y = v1.y;
			this._z = v1.z;
			this._w = r;

			this.normalize();

			return this;

		}

	}(),

	inverse: function () {

		this.conjugate().normalize();

		return this;

	},

	conjugate: function () {

		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;

		this.onChangeCallback();

		return this;

	},

	dot: function ( v ) {

		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

	},

	lengthSq: function () {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	},

	length: function () {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	},

	normalize: function () {

		var l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		this.onChangeCallback();

		return this;

	},

	add: function ( q ) {

		this._x = this._x + q.x;
		this._y = this._y + q.y;
		this._z = this._z + q.z;
		this._w = this._w + q.w;

		this.onChangeCallback();

		return this;	

	},

	multiply: function ( q, p ) {

		if ( p !== undefined ) {

			console.warn( 'THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.' );
			return this.multiplyQuaternions( q, p );

		}

		return this.multiplyQuaternions( this, q );

	},

	multiplyScalar: function ( scalar ) {

		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;
		this._w *= scalar;

		this.onChangeCallback();

		return this;

	},

	multiplyQuaternions: function ( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this.onChangeCallback();

		return this;

	},

	multiplyVector3: function ( vector ) {

		console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
		return vector.applyQuaternion( this );

	},

	slerp: function ( qb, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( qb );

		var x = this._x, y = this._y, z = this._z, w = this._w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

		if ( cosHalfTheta < 0 ) {

			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( qb );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;

			return this;

		}

		var halfTheta = Math.acos( cosHalfTheta );
		var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if ( Math.abs( sinHalfTheta ) < 0.001 ) {

			this._w = 0.5 * ( w + this._w );
			this._x = 0.5 * ( x + this._x );
			this._y = 0.5 * ( y + this._y );
			this._z = 0.5 * ( z + this._z );

			return this;

		}

		var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
		ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );

		this.onChangeCallback();

		return this;

	},

	equals: function ( quaternion ) {

		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

	},

	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];

		this.onChangeCallback();

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;

		return array;

	},

	onChange: function ( callback ) {

		this.onChangeCallback = callback;

		return this;

	},

	onChangeCallback: function () {},

	clone: function () {

		return new THREE.Quaternion2( this._x, this._y, this._z, this._w );

	}

};

THREE.Quaternion2.slerp = function ( qa, qb, qm, t ) {

	return qm.copy( qa ).slerp( qb, t );

}

// File:src/math/DualQuaternion.js

/**
 * @author lars ivar hatledal / http://laht.info
 */

THREE.DualQuaternion2 = function ( r, d ) {

	this._real = r || new THREE.Quaternion( 0, 0, 0, 1 );
	this._real.normalize();
	if ( d ) {
		if ( d instanceof THREE.Vector3 ) {
			this._dual = new THREE.Quaternion2( d.x, d.y, d.z, 0 ).multiply( this._real ).multiplyScalar( 0.5 );
		} else {
			this._dual = d;
		}
	} else {
		this._dual = new THREE.Quaternion2( 0, 0, 0, 0 );
	} 
};

THREE.DualQuaternion2.prototype = {
	
	constructor: THREE.DualQuaternion2,

	_real: new THREE.Quaternion2( 0, 0, 0, 1 ), _dual: new THREE.Quaternion2( 0, 0, 0, 0 ),

	get real () {

		return this._real;

	},

	get dual () {

		return this._dual;

	}, 

	set: function ( real, dual ) {

		this._real = real.normalize();
		this._dual = dual;

		return this;

	},

	identity : function () {

		this._real = new THREE.Quaternion ( 0, 0, 0, 1 );
		this._dual = new THREE.Quaternion ( 0, 0, 0, 0 );

		return this;

	},

	compose: function ( position, quaternion ) {

		this._real = quaternion.normalize();
		this._dual = new THREE.Quaternion( position.x, position.y, position.z, 0 ).multiply( this._real ).multiplyScalar( 0.5 );

	},

	makeTranslation: function ( x, y, z ) {

		this._real = new THREE.Quaternion ( 0, 0, 0, 1 );
		this._dual = new THREE.Quaternion( x, y, z, 0 ).multiply( this._real ).multiplyScalar( 0.5 );
		
		return this;
		
	},

	makeRotation: function ( q ) {

		this._real = q.normalize();
		this.dual = new THREE.Quaternion ( 0, 0, 0, 0 );

		return this;

	},

	makeRotationX: function ( angle ) {

		return new THREE.DualQuaternion().makeRotation( new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3( 1, 0, 0 ), angle ) );

	},

	makeRotationY: function ( angle ) {

		return new THREE.DualQuaternion().makeRotation( new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3( 0, 1, 0 ), angle ) );

	},

	makeRotationZ: function ( angle ) {

		return new THREE.DualQuaternion().makeRotation( new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3( 0, 0, 1 ), angle ) );

	},

	normalize: function () {

		var n = 1.0 / this._real.length();
		this._real.multiplyScalar( n );
		this._dual.multiplyScalar( n );

		return this;

	},

	conjugate: function () {

		this._real.conjugate();
		this._dual.conjugate();

		return this;

	},

	dot: function ( q ) {

		return this._real.dot( q.real );

	},

	getRotation: function () {

		return this._real;	

	},

	getEuler: function () {
		var ex, ey, ez;

		var r = this._real;
		var x = r.x; var y = r.y; var z = r.z; var w = r.w;

		var sqw = w * w;
		var sqx = x * x;
		var sqy = y * y;
		var sqz = z * z;
		var unit = sqx + sqy + sqz + sqw; // if normalized is one, otherwise
		// is correction factor
		var test = x * y + z * w;
		if ( test > 0.499 * unit ) { // singularity at north pole
		    ey = 2 * Math.atan2( x, w );
		    ez = Math.PI * 0.5;
		    ex = 0;
		} else if ( test < -0.499 * unit ) { // singularity at south pole
		    ey = -2 * Math.atan2( x, w );
		    ez = -Math.PI * 0.5;
		    ex = 0;
		} else {
		    ey = Math.atan2( 2 * y * w - 2 * x * z, sqx - sqy - sqz + sqw );
		    ez = Math.asin( 2 * test / unit );
		    ex = Math.atan2( 2 * x * w - 2 * y * z, -sqx + sqy - sqz + sqw );
		}

		return new THREE.Euler( ex, ey, ez );

	},

	getTranslation: function () {

		var t = new THREE.Quaternion2().multiplyQuaternions( this._dual.clone().multiplyScalar( 2 ), this._real.clone().conjugate() );

		return new THREE.Vector3( t.x, t.y, t.z );

	},

	setTranslation: function ( v ) {
		this._dual.multiplyQuaternions2( new THREE.Quaternion( v.x, v.y, v.z, 0 ), this._real ).multiplyScalar( 0.5 );

		return this;
	},

	multiplyScalar: function( scalar ) {
		
		this._real.multiplyScalar( scalar ).normalize();
		this._dual.multiplyScalar( scalar );

		return this;

	},

	multiply: function ( q ) {

		return this.multiply( this, q );

	},

	multiply: function ( q1, q2  ) {

		q1 = q1.clone().normalize();
		q2 = q2.clone().normalize();

		this._real.multiplyQuaternions( q1.real, q2.real );
		this._real.normalize();
		this._dual.multiplyQuaternions( q1.real, q2.dual )
						.add( new THREE.Quaternion2().multiplyQuaternions( q1.dual, q2.real ) );

		return this;

	},

	setFromAxisAngleAndTranslation: function ( axis, angle, v ) {
		
		this._real.setFromAxisAngle( axis, angle ).normalize();
		this._dual.set( v.x, v.y, v.z, 0 ).multiply(this._real).multiplyScalar( 0.5 );

		return this;

	}, 

	setFromEulerAndTranslation: function ( x, y, z, v) {

		this._real.setFromEuler( new THREE.Euler( x,y,z ) ).normalize();
		this._dual.set( v.x, v.y, v.z, 0 ).multiply(this._real).multiplyScalar( 0.5 );

		return this;

	},

	copy: function ( q ) {

		this._real = new THREE.Quaternion2().copy( q.real );
		this._dual = new THREE.Quaternion2().copy( q.dual );

		return this

	},

	clone: function () {

		return new THREE.DualQuaternion2( this._real.clone(), this._dual.clone() );

	}
	
};

THREE.DualQuaternion2.ScLERP = function( from, to, t ) {

        var dot = from.real.dot(to.real);

        if (dot < 0) {
            to = to.clone().multiplyScalar( -1 );
        }

        var diff = new THREE.DualQuaternion2().multiply( from.clone().conjugate(), to );

        var vr = new THREE.Vector3(diff.real.x, diff.real.y, diff.real.z);
        var vd = new THREE.Vector3(diff.dual.x, diff.dual.y, diff.dual.z);

        var invr = 1.0 / Math.sqrt(vr.dot(vr));

        var angle = 2 * Math.acos(diff.real.w);
        var pitch = -2 * diff.dual.w * invr;
        var direction = new THREE.Vector3().copy(vr).multiplyScalar(invr);
        var moment = new THREE.Vector3().copy(vd).sub(new THREE.Vector3().copy(direction).multiplyScalar(pitch * diff.real.w * 0.5));
	moment.multiplyScalar(invr);

        angle *= t;
        pitch *= t;

        var sinAngle = Math.sin(0.5 * angle);
        var cosAngle = Math.cos(0.5 * angle);

	var v = new THREE.Vector3().copy(direction).multiplyScalar(sinAngle);
        var real = new THREE.Quaternion2(v.x, v.y, v.z, cosAngle);
	v.copy(moment.multiplyScalar(sinAngle).add(direction.multiplyScalar(pitch * 0.5 * cosAngle)));
        var dual = new THREE.Quaternion2(v.x, v.y, v.z, -pitch * 0.5 * sinAngle);

        return new THREE.DualQuaternion2().multiply(from, new THREE.DualQuaternion2(real, dual));

}