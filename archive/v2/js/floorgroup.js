( function ( window ) {

	function FloorGroup( floorPosition, floorValue ) {
		this.initialize( floorPosition, floorValue );
	}
	
	var p = FloorGroup.prototype = new createjs.Container();
	var floorCell;
	var result;
	var spaceFloor = 0;

	p.Container_initialize = p.initialize;
	
	p.initialize = function ( floorPosition, floorValue ) {
		this.Container_initialize();
		
		this.floorflameleft = 160;
		this.floorflameright = 840;
		this.floorflameheight = 20;
		this.collection = [];
	
		floorCell = [ 160, 240, 320, 400 ,480, 560, 640, 720 ];
	
	
		var block      = 0;
		var maxBlock   = 8;
		var blockSpace = 0;
		var sell;
		
		//１フロア目
		if ( floorValue === 1 ) {
			while ( block < maxBlock ) {
			sell = new Floor( floorCell[ block ], floorPosition, 1 );
			this.collection.push( sell );
			block++;
			}
			return;
		}
	
		//２フロア以降
		while ( block < maxBlock ){
			var rand = Math.floor( Math.random() * ( maxBlock - 1 ) + 1 );
			switch ( rand ) {
			case 1:
				sell = new Floor( floorCell[ block ], floorPosition, 1 );
				block +=1;
				break;
			case 2:
				if ( block > 6 ) {
					sell = new Floor( floorCell[ block ], floorPosition, 1 );
					block += 1;
				} else {
					sell = new Floor( floorCell[ block ], floorPosition, 2 );
					block += 2;
				}
				break;
			case 3:
				if ( block > 5 ) {
					sell = new Floor( floorCell[ block ], floorPosition, 1 );
					block += 1;
				} else {
					sell = new Floor( floorCell[ block ], floorPosition, 3 );
					block += 3;
				}
				break;
			default :
				block +=1;
				sell = false;
				spaceFloor++;
				break;
			}
			if ( sell ) this.collection.push( sell );
		}
		
		if ( spaceFloor == maxBlock ) {
			while ( blockSpace < maxBlock ) {
				sell = new Floor( floorCell[ blockSpace ], floorPosition, 1 );
				this.collection.push( sell );
				blockSpace++;
			}
		}
		spaceFloor = 0;
	};
		
	p.getfloor = function() {
		return this.collection;
	};
	
	
	p.isCollisionCheck = function( playerFloorGroup, aniY ) {
		for ( var i = 0;i < this.collection.length;i++ ) {
			result = this.collection[i].isCollisionCheckFloor( playerFloorGroup, aniY );
			if ( result ) return result;
		}
		return result;
	};
	
	window.FloorGroup = FloorGroup;
}( window ) );
