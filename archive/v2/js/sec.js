( function ( window ) {
	function Sec( x, y ) {
		this.initialize( x, y );
	}
	var p = Sec.prototype = new createjs.Container();
	
	p.Container_initialize = p.initialize;
	
	p.initialize = function ( x, y ) {
		this.secImage = new createjs.Bitmap( './img/5sec.png' );
		this.secImage.x = x;
		this.secImage.y = y;
		this.secImage.width = 20;
		this.secImage.height = 20;
		this.addChild( this.secImage );
		return this;
	};
	
	p.getSecPosition = function() {
		return { x: this.secImage.x, y: this.secImage.y };
	};
	
	p.moveSecPositionY = function( y ) {
		this.secImage.y += y;
	};
	
	p.removeSec = function() {
		this.removeChildAt( this.secImage );
	};
	
	p.isCollisionCheckSec = function( playerX, playerY ) {
		if (playerX + 30 < this.secImage.x + this.secImage.width &&
			playerX + 90 > this.secImage.x &&
			playerY + 10 < this.secImage.y + this.secImage.height &&
			playerY + 130 > this.secImage.y
			) {
			return true;
		} else {
			return false;
		}
	};
	
	window.Sec = Sec;
}( window ));
