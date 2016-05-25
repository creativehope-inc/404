var easeljs       = require( 'easeljs' ),
	tweenjs       = require( 'tweenjs' ),
	soundjs       = require( 'soundjs' ),
	preloadjs     = require( 'preloadjs' ),
	$             = require( 'jquery' );

var StaticBitmap  = function () {
	createjs.Bitmap.prototype.constructor.apply( this , arguments );
};
createjs.extend( StaticBitmap, createjs.Bitmap );
StaticBitmap.prototype.setCordinate = function( cordinate ) {
	this.x = cordinate.x;
	this.y = cordinate.y;
};

module.exports = StaticBitmap;
