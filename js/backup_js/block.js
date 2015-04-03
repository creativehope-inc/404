var BLOCK_WIDTH	 = 50;
var BLOCK_HEIGHT = 50;
var BLOCK_FRAME	 = 0;
var BlockType 	 = 0;
var checkBlock   = false;
var checkBlock2  = false;
	
	//ブロックの親のクラス
var Block = Class.create( Sprite,{
	initialize : function( x, y ){
		Sprite.call( this, BLOCK_WIDTH, BLOCK_HEIGHT );
		this.frame = BLOCK_FRAME;
		this.x = x;
		this.y = y;
		this._style.zIndex = 1;
		this.opacity = 1;
		this.on('enterframe', function() {
			if (this.frame == 2) {
				this.opacity -= 0.1;
			}
		});
	},//上と左右の確認をする為の関数
	setTop: function ( blocks ) {
		this.top  = getBlock( blocks, this.x, this.y -53 );
		this.top2 = getBlock( blocks, this.x, this.y -106 );
		this.top3 = getBlock( blocks, this.x, this.y -159 );
	},
	setRight: function( blocks ){
		this.right  = getBlock( blocks, this.x +53,  this.y );
		this.right2 = getBlock( blocks, this.x +106, this.y );
		this.right3 = getBlock( blocks, this.x +159, this.y );
	},
	setLeft: function( blocks ){
		this.left  = getBlock( blocks, this.x - 53,  this.y );
		this.left2 = getBlock( blocks, this.x - 106, this.y );
		this.left3 = getBlock( blocks, this.x - 159, this.y );
	}
});
//ブロック「ぴ」
var Block_pi = Class.create( Block,{
	initialize : function( x, y ){
		Block.call( this, x, y );
		this.image = global.game.assets[IMAGE_BLOCK_PI];	
	},
	checkBlock_pi: function( blocks ) {
		if ( this.top instanceof Block_co ) {
			if (this.top2 instanceof Block_mo) {
				if (this.top3 instanceof Block_nn ) {
					checkBlock = true;
					vanishFlag = true;
				}
			}
		}
		if ( this.right instanceof Block_co) {
			if (this.right2 instanceof Block_mo) {
				if (this.right3 instanceof Block_nn) {
					checkBlock2 = true;
					vanishFlag = true;
				}
			}
		}
		if (checkBlock) {
			this.frame      = 2;
			this.top.frame  = 2;
			this.top2.frame = 2;
			this.top3.frame = 2;
		}
		checkBlock = false;
		if (checkBlock2) {
			this.frame        = 2;
			this.right.frame  = 2;
			this.right2.frame = 2;
			this.right3.frame = 2;
		}
		checkBlock2 = false;
	}
});
//ブロック「こ」
var Block_co = Class.create( Block,{
	initialize : function( x, y ){
		Block.call( this, x, y );
		this.image = global.game.assets[IMAGE_BLOCK_CO];	
	},
	checkBlock_co: function( blocks ){
		if ( this.left instanceof Block_pi ) {
			if ( this.right instanceof Block_mo) {
				if (this.right2 instanceof Block_nn) {
					checkBlock = true;
					vanishFlag = true;
				}
			}
		}
		if (checkBlock) {
			this.frame        = 2;
			this.left.frame   = 2;
			this.right.frame  = 2;
			this.right2.frame = 2;
		}
		checkBlock = false;
		
	}
});
//ブロック「も」
var Block_mo = Class.create( Block,{
	initialize : function( x, y ){
		Block.call( this, x, y );
		this.image = global.game.assets[IMAGE_BLOCK_MO];
	},
	checkBlock_mo: function( ){
		if ( this.right instanceof Block_nn ) {
			if (this.left instanceof Block_co) {
				if (this.left2 instanceof Block_pi) {
					checkBlock = true;
					vanishFlag = true;
				}
			}
		}
		if (checkBlock) {
			this.frame       = 2;
			this.right.frame = 2;
			this.left.frame  = 2;
			this.left2.frame = 2;
		}
		checkBlock = false;
	}
});
//ブロック「ん」
var Block_nn = Class.create( Block,{
	initialize : function( x, y ){
		Block.call( this, x, y );
		this.image = global.game.assets[IMAGE_BLOCK_NN];
	},	
	checkBlock_nn : function( blocks ) {//上のブロックを調べにいく
		if ( this.top instanceof Block_mo ) {
			if (this.top2 instanceof Block_co) {
				if (this.top3 instanceof Block_pi ) {
					checkBlock = true;
					vanishFlag = true;
				}
			}
		}
		if ( this.left instanceof Block_mo) {
			if (this.left2 instanceof Block_co) {
				if (this.left3 instanceof Block_pi) {
					checkBlock2 = true;
					vanishFlag = true;
				}
			}
		}
		if (checkBlock) {
			this.frame      = 2;
			this.top.frame  = 2;
			this.top2.frame = 2;
			this.top3.frame = 2;
			
		}
		checkBlock = false;
		if (checkBlock2) {
			this.frame       = 2;
			this.left.frame  = 2;
			this.left2.frame = 2;
			this.left3.frame = 2;
		}
		checkBlock2 = false;
	}
});

var NextBlock = Class.create(Sprite, {//次のブロックのクラス
	initialize : function( x, y ){
		Sprite.call ( this, BLOCK_WIDTH,BLOCK_HEIGHT );
		this.image = global.game.assets[ IMAGE_NEXT ];
		this.x = BACKGROUND_WIDTH - 200 + 220/3;
		this.y = BACKGROUND_HEIGHT - 122;
	}
});

var Magic = Class.create( Sprite, {//発射のエフェクト
	initialize : function( x, y ){
		Sprite.call ( this,55, 62 );
		this.image = global.game.assets[IMAGE_MAGIC];
		this.tl.fadeOut( 10 );
	}	
});

function getBlock( blocks, bx, by ) {
	return _.find( blocks, function ( block ){
		return block.x == bx && block.y == by;
	});
}



