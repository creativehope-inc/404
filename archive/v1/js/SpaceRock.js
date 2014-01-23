(function (window) {

	function SpaceRock(size) {
		this.initialize(size);
	}

	var p = SpaceRock.prototype = new createjs.Container();

	SpaceRock.LRG_ROCK = 60;
	SpaceRock.SML_ROCK = 25;

	p.bounds;	//visual radial size
	p.hit;		//average radial disparity
	p.size;		//size value itself
	p.spin;		//spin ammount
	p.score;	//score value

	p.vX;		//velocity X
	p.vY;		//velocity Y

	p.active;	//is it active

// constructor:
	p.Shape_initialize = p.initialize;	//unique to avoid overiding base class

	p.initialize = function ( size ) {
		this.Shape_initialize(); // super call

		this.activate( size );
	}

// public methods:

	//handle reinit for poolings sake
	p.activate = function ( size ) {
		this.size   = size;
		this.hit    = size;
		this.bounds = 0;

		switch ( size ) {
			case SpaceRock.LRG_ROCK:
				this.rockFlame   = new createjs.Bitmap( './img/drag_01.png' );
				this.rockFlame.x = -75;
				this.rockFlame.y = -62;
				break;
			case SpaceRock.SML_ROCK:
				this.rockFlame   = new createjs.Bitmap( './img/shooted_drag_01.png' );
				this.rockFlame.x = -25;
				this.rockFlame.y = -25;
				break;
		}
		this.removeAllChildren();
		this.addChild(this.rockFlame);

		//pick a random direction to move in and base the rotation off of speed
		var angle = Math.random() * ( Math.PI * 2 );
		this.vX   = Math.sin( angle ) * ( 5 - size / 10 );
		this.vY   = Math.cos( angle ) * ( 5 - size / 10 );
		this.spin = ( Math.random() + 0.2 ) * this.vX;

		//associate score with size
		this.score  = ( 5 - size / 10 ) * 100;
		if ( this.score < 0 ) this.score -= this.score;
		this.active = true;
	}

	//handle what a spaceRock does to itself every frame
	p.tick = function ( event ) {
		this.rotation += this.spin;
		this.x += this.vX;
		this.y += this.vY;
	}

	//position the spaceRock so it floats on screen
	p.floatOnScreen = function ( width, height ) {
		//base bias on real estate and pick a side or top/bottom
		if ( Math.random() * ( width + height ) > width ) {
			//side; ensure velocity pushes it on screen
			if ( this.vX > 0 ) {
				this.x = -2 * this.bounds;
			} else {
				this.x = 2 * this.bounds + width;
			}
			//randomly position along other dimension
			if ( this.vY > 0 ) {
				this.y = Math.random() * height * 0.5;
			} else {
				this.y = Math.random() * height * 0.5 + 0.5 * height;
			}
		} else {
			//top/bottom; ensure velocity pushes it on screen
			if ( this.vY > 0 ) {
				this.y = -2 * this.bounds;
			} else {
				this.y = 2 * this.bounds + height;
			}
			//randomly position along other dimension
			if ( this.vX > 0 ) {
				this.x = Math.random() * width * 0.5;
			} else {
				this.x = Math.random() * width * 0.5 + 0.5 * width;
			}
		}
	}

	p.hitPoint = function ( tX, tY ) {
		return this.hitRadius( tX, tY, 0 );
	}

	p.hitRadius = function ( tX, tY, tHit ) {
		//early returns speed it up
		if ( tX - tHit > this.x + this.hit ) return;
		if ( tX + tHit < this.x - this.hit ) return;
		if ( tY - tHit > this.y + this.hit ) return;
		if ( tY + tHit < this.y - this.hit ) return;

		//now do the circle distance test
		return this.hit + tHit > Math.sqrt( Math.pow( Math.abs( this.x - tX ), 2 ) + Math.pow( Math.abs( this.y - tY ), 2 ) );
	}


	window.SpaceRock = SpaceRock;

}(window));
