( function ( window ) {
	function Item( y ) {
		this.initialize( y );
	}
	var p = Item.prototype = new createjs.Container();
	
	p.Container_initialize = p.initialize;
	
	p.initialize = function ( y ) {
		this.itemImage = new createjs.Bitmap( './img/img_item.png' );
		this.itemImage.x = Math.floor( Math.random() * ( 750 - 160 ) + 160 );
		this.itemImage.y = y;
		this.itemImage.width = 20;
		this.itemImage.height = 20;
		this.addChild( this.itemImage );
		return this;
	};
	
	p.getItemPosition = function() {
		return { x: this.itemImage.x, y: this.itemImage.y };
	};
	
	p.moveItemPositionY = function( y ) {
		this.itemImage.y += y;
	};
	
	p.removeItem = function() {
		this.removeChildAt( this.itemImage );
	};
	
	p.isCollisionCheckItem = function( playerX, playerY ) {
		if (playerX + 30 < this.itemImage.x + this.itemImage.width &&
			playerX + 90 > this.itemImage.x &&
			playerY + 10 < this.itemImage.y + this.itemImage.height &&
			playerY + 130 > this.itemImage.y
			) {
			return true;
		} else {
			return false;
		}
	};
	
	window.Item = Item;
}( window ));
