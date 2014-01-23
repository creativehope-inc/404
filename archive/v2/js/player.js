( function ( window ) {

	function Player() {
		this.initialize();
	}
	var p = Player.prototype = new createjs.Container();
	
	var prevDirection = 0;
	var where;
	
	var floorY;
	var stockWhere = 0;
	var itemWhere;
	
	p.Container_initialize = p.initialize;
	
	var animation;
	p.initialize = function () {
		this.Container_initialize();
		this.width = 130;
		this.height = 140;
		animation = this.createAnimation();
		animation.x = STAGE_WIDTH / 2.3;
		animation.y = STAGE_HEIGHT - 200;
		vY = 0;
		where = 0;
		itemWhere = 0;
		this.setKeyEvent( this );
		createjs.Ticker.setFPS(20);
		createjs.Ticker.addEventListener( "tick", this.tick );
	};
	
	p.getAnimation = function(){
		return animation;
	};
	
	p.setFloorY =  function( fY ) {
		floorY = fY + 20;
	};
	
	p.setVy = function( velocity ) {
		vY = velocity;
	};
	
	p.getVy = function() {
		return vY;
	};
	
	p.getWhere = function() {
		return where;
	};
	
	p.getAnimationY = function() {
		return animation.y;
	};
	
	p.setCollision = function() {
		isStand = true;
	};
	
	p.setNotCollision = function() {
		isStand = false;
	};
	
	p.setKeyEvent = function () {
	
		document.addEventListener( 'keydown', handleKeyDown, false );
		document.addEventListener( 'keyup', handleKeyUp, false );
		
		function handleKeyDown ( e ) {
			if ( e.keyCode == 32 ) {
				e.preventDefault();
				if ( isStand ) {
					isSpacePush = true;
					isJumping = true;
					isStand = false;
					createjs.Sound.play( "jump" );
				}
			} else if ( e.keyCode == 37 ) {
				e.preventDefault();
				isLeftKeyPush = true;
			} else if ( e.keyCode == 39 ) {
				e.preventDefault();
				isRightKeyPush = true;
			}
		}
		
		function handleKeyUp ( e ) {
			animation.gotoAndPlay( 'stand' );
			isLeftKeyPush = false;
			isRightKeyPush = false;
		}
	};

	p.tick = function( event ) {
		animation.y += vY;
		if ( animation.y < 200 && isSpacePush ) {
			where++;
			itemWhere++;
		}
		
		if ( isJumping && isSpacePush ) {
			animation.y -= 30;
			if ( animation.y < 180 ) {
				isSpacePush = false;
				vY = 25;
				stockWhere = where;
			}
			animation.gotoAndPlay( 'jump' );
			prevDirection = 3;
		}
		
		if ( animation.y + 120 > floorY ) {
			where--;
		}
		
		if ( isLeftKeyPush  === true ) {
			animation.x -= 10;
			if ( prevDirection !== 0 ) {
				animation.gotoAndPlay( 'leftrun' );
				prevDirection = 0;
			}
		}
		if ( isRightKeyPush  === true ) {
			animation.x += 10;
			if ( prevDirection != 1 ) {
				animation.gotoAndPlay( 'rightrun' );
				prevDirection = 1;
			}
		}
		if ( isSpacePush === false && isLeftKeyPush === false && isRightKeyPush === false ) {
			if ( prevDirection != 2 ) {
					animation.gotoAndPlay( 'stand' );
					prevDirection = 2;
					isJumping = false;
					isStand = true;
			}
		}
	};
	
	p.createAnimation = function () {
		
		var data = {
			images: [ './img/img_player.png' ],
			frames: [	[ 0, 0, 130, 140 ],
					[ 130, 0, 130, 140 ],
					[ 0, 140, 130, 140 ],
					[ 130, 142, 130, 140 ],
					[ 0, 280, 130, 140 ],
					[ 130, 280, 130, 140 ],
					[ 0, 420, 130, 140 ],
					[ 130, 420, 130, 140 ],
					[ 130, 560, 130, 140 ],
					[ 130, 560, 130, 140 ]
					],
			animations : {
				stand: {
					frames: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ]
				},
				leftrun: {
					frames: [ 2, 2, 3, 3, ]
				},
				rightrun: {
					frames: [ 4, 4, 5, 5 ]
				},
				jump: {
					frames: [ 6, 7 ]
				}
			}
		};
		
		var mySpriteSheet = new createjs.SpriteSheet( data );
		return new createjs.Sprite( mySpriteSheet );
	};

	window.Player = Player;

}( window ) );
