module.exports = {
	//変更される値
	isSpaceHeld : false ,
	isClickHeld : false ,
	isTapHeld   : false ,
	isPlay    : false ,
	
	pressSpaceHeld : function() {
		this.isSpaceHeld = true;
		this.isPlay    = true;
	},
	
	upSpaceHeld    : function() {
		this.isSpaceHeld = false;
		this.isPlay      = false;
	},

	pressClickHeld : function() {
		this.isClickHeld = true;
		this.isPlay    = true;
	},

	upClickHeld    : function() {
		this.isClickHeld = false;
		this.isPlay      = false ;
	},
	
	pressTapHeld   : function() {
		this.isTapHeld   = true;
		this.isPlay    = true;
	},

	upTapHeld      : function() {
		this.isTapHeld   = false;
		this.isPlay      = false;
	},

	globalAccess   : function() {
		console.log(stage);
	},
}
	