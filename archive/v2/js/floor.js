( function ( window ) {
	function Floor( x, y, type ) {
		this.initialize( x, y, type );
	}

	var p = Floor.prototype = new createjs.Container();
	
	p.Container_initialize = p.initialize;
	
	p.initialize = function ( x, y, type ) {
		this.Container_initialize();
		var width, name;
	
		switch ( type ) {
			case 1:
				name  = './img/img_floor1.png';
				width = 80;
				break;
			case 2:
				name  = './img/img_floor2.png';
				width = 160;
				break;
			case 3:
				name  = './img/img_floor3.png';
				width = 240;
				break;
			default: return;
		}
		
		this.floorImage = new createjs.Bitmap( name );
		this.floorImage.x = x;
		this.floorImage.y = y;
		this.floorImage.width = width;	
		this.addChild( this.floorImage );
	};
	
	p.isCollisionCheckFloor = function( playerFloor, aniY ) {
		if ( !isSpacePush &&
			aniY + 130 > this.floorImage.y &&
			playerFloor.children[0].x + 90 > this.floorImage.x &&
			playerFloor.children[0].x + 40 < this.floorImage.x + this.floorImage.width ) {
			return true;
		}
		return false;
	};
	
	window.Floor = Floor;
}( window ) );
