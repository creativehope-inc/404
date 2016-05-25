var easeljs       = require( 'easeljs' ),
	tweenjs       = require( 'tweenjs' ),
	soundjs       = require( 'soundjs' ),
	preloadjs     = require( 'preloadjs' ),
	$             = require( 'jquery' );

var SushiClass  = function () {
	createjs.Bitmap.prototype.constructor.apply( this,arguments );
};
	
createjs.extend(SushiClass, createjs.Bitmap);
	
SushiClass.prototype.tick = function() {
	this.x -= this.vX;
};

module.exports = SushiClass;