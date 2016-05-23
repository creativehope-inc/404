var easeljs       = require( 'easeljs' ),
	tweenjs       = require( 'tweenjs' ),
	soundjs       = require( 'soundjs' ),
	preloadjs     = require( 'preloadjs' ),
	$             = require( 'jquery' ),
	DynamicBitmap  = function () {
		createjs.Bitmap.prototype.constructor.apply( this,arguments );
	};
	createjs.extend(DynamicBitmap, createjs.Bitmap);
	DynamicBitmap.prototype.setCordinate = function( cordinate ) {
		this.x = cordinate.x;
		this.y = cordinate.y;
	};

module.exports = DynamicBitmap;