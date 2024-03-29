enchant();

var SOUND_NORMAL    = "./sound/GameNormalBGM_01.ogg| ./sound/GameNormalBGM_01.mp3";
var SOUND_START     = "./sound/GameStartSound_01.ogg| ./sound/GameStartSound_01.mp3";
var SOUND_NAGERU    = "./sound/BlockKuttukiSound_01.ogg| ./sound/BlockKuttukiSound_01.mp3";
var SOUND_LIMIT     = "./sound/GameTimeLimitBGM_01.ogg| ./sound/GameTimeLimitBGM_01.mp3";
var SOUND_HAMARU    = "./sound/BlockNageruSound_01.ogg| ./sound/BlockNageruSound_01.mp3";
var SOUND_VANISH    = "./sound/BlockKieruSound_01.ogg| ./sound/BlockKieruSound_01.mp3";
var SOUND_LIMITCOME = "./sound/TimeLimitCommingSound_01.ogg| ./sound/TimeLimitCommingSound_01.mp3";
var SOUND_OUT       = "./sound/TimeOutSound_01.ogg| ./sound/TimeOutSound_01.mp3";
var SOUND_END       = "./sound/GameRankingBGM_01.ogg| ./sound/GameRankingBGM_01.mp3";

var IMAGE_KAEDE      ="./img/kaede_merge.png";
var IMAGE_BACKGROUND = "./img/p_back.png";
var IMAGE_BLOCK_PI   = "./img/p_1merge.png";
var IMAGE_BLOCK_CO   = "./img/p_2merge.png";
var IMAGE_BLOCK_MO   = "./img/p_3merge.png";
var IMAGE_BLOCK_NN   = "./img/p_4merge.png";
var IMAGE_NEXT       = "./img/next_merge.png";
var IMAGE_START      = "./img/pazupico_exp.jpg";
var IMAGE_OTH        = "./img/column_back_fill.png";
var IMAGE_SELECT     = "./img/p_select.png";
var IMAGE_MAGIC      = "./img/p_magic.png";
var IMAGE_SCORE      = "./img/score.png";
var IMAGE_GAGE       = "./img/score_bottom.jpg";
var IMAGE_SOUND      = "./img/sound_merge.png";
var IMAGE_5sec       = "./img/time_5sec.png";
var IMAGE_KEY        = "./img/keyboard_2.png";


var ASSETS =[
    IMAGE_KAEDE,
    IMAGE_BACKGROUND,
    IMAGE_BLOCK_PI,
    IMAGE_BLOCK_CO,
    IMAGE_BLOCK_MO,
    IMAGE_BLOCK_NN,
    IMAGE_NEXT,
    IMAGE_START,
    IMAGE_OTH,
    IMAGE_SELECT,
    IMAGE_MAGIC,
    IMAGE_SCORE,
    IMAGE_GAGE,
    IMAGE_SOUND,
    IMAGE_5sec,
    IMAGE_KEY, 
];

var SCREEN_WIDTH      = 960;
var SCREEN_HEIGHT     = 600;
var BACKGROUND_WIDTH  = 960 ;
var BACKGROUND_HEIGHT = 600;
var BACKGROUND_COLOR  = "#2b3d4f";
var GAME_SPEED        = 5;
var GAME_FPS          = 30;
var GAME_TIME_LIMIT   = GAME_FPS * 120;

var global = {
    game        : null,
    sound       : null,
    kaede       : null,
    block       : null,
    score       : 0,
    progress    : 0,
    keybindFlag : true,
    soundType   : null
    
};

global.sound = {
    normal : createjs.Sound.createInstance( SOUND_NORMAL ),
    start  : createjs.Sound.createInstance( SOUND_START ),
    nageru : createjs.Sound.createInstance( SOUND_NAGERU ),
    limit  : createjs.Sound.createInstance( SOUND_LIMIT ),
    hamaru : createjs.Sound.createInstance( SOUND_HAMARU ),
    vanish : createjs.Sound.createInstance( SOUND_VANISH ),
    limitcome : createjs.Sound.createInstance( SOUND_LIMITCOME ),
    out    : createjs.Sound.createInstance( SOUND_OUT ),
    end    : createjs.Sound.createInstance( SOUND_END ),
    mute  : function() {
		this.normal.setMute( true );
		this.start.setMute( true );
		this.nageru.setMute( true );
		this.limit.setMute( true );
		this.hamaru.setMute( true );
		this.vanish.setMute( true );
		this.limitcome.setMute( true );
		this.out.setMute( true );
		this.end.setMute( true );
    },
    unmute  : function() {
		this.normal.setMute( false );
		this.start.setMute( false );
		this.nageru.setMute( false );
		this.limit.setMute( false );
		this.hamaru.setMute( false );
		this.vanish.setMute( false );
		this.limitcome.setMute( false );
		this.out.setMute( false );
		this.end.setMute( false );
    }
};


window.onload = function() {
   var queue = new createjs.LoadQueue( true );
	queue.installPlugin( createjs.Sound );
	var manifest = [
		{ "src" : SOUND_NORMAL,   "id" : "normal"},
		{ "src" : SOUND_START, "id" : "start"},
		{ "src" : SOUND_NAGERU,  "id" : "nageru" },
		{ "src" : SOUND_LIMIT,  "id" : "limit" },
		{ "src" : SOUND_HAMARU,  "id" : "hamaru" },
		{ "src" : SOUND_VANISH, "id" : "vanish" },
		{ "src" : SOUND_LIMITCOME, "id" : "limitcome" },
		{ "src" : SOUND_OUT, "id" : "out" },
		{ "src" : SOUND_END, "id" : "end" }
	];
	queue.addEventListener('complete', gameStart );
	queue.loadManifest( manifest, true );

	var js = document.createElement( 'script' );
	js.src = 'https://www.picomon.jp/game/get_solt.js';
	var fjs = document.getElementsByTagName( 'script' )[ 0 ];
	fjs.parentNode.insertBefore( js, fjs );
};

var gameStart = function (){
    global.game = new Core( SCREEN_WIDTH, SCREEN_HEIGHT );
    global.game.preload( ASSETS );
    global.game.fps = GAME_FPS;
    
    global.game.onload = function() {
	global.game.replaceScene(createTitleScene() );    
    };
    var createTitleScene = function() {//タイトルシーン作成
		var scene = new Scene();
		scene.backgroundColor = BACKGROUND_COLOR;
		var startimage = new Sprite ( SCREEN_WIDTH , SCREEN_HEIGHT );//タイトルのイメージ
		startimage.image = global.game.assets[ IMAGE_START ];
		startimage.addEventListener ( Event.TOUCH_START, function(e) {//タッチでゲーム画面へ
			global.game.replaceScene( createGameScene() ); 
		});
		scene.addChild(startimage);
	
		//音のオンオフ
		var soundS = new Sprite (51,21);
		soundS.image = global.game.assets[IMAGE_SOUND];
		soundS.x = 15;
		soundS.y = 10;
		soundS.frame = global.soundType;
		soundS._style.zIndex = 1;
		soundS.ontouchstart = function(){
			if (soundS.frame === 0) {
				global.sound.unmute();
				soundS.frame = 1;
			}else{
				global.sound.mute();
				soundS.frame = 0;
			}
    		global.soundType = soundS.frame;
		};
		scene.addChild(soundS);
		return scene;
    };
    global.game.start();
};