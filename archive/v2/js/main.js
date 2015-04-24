
	var STAGE_WIDTH = 960;
	var STAGE_HEIGHT = 540;
	var STAGEOUT_WIDTH = 160;
	
	var isSpacePush;
	var isLeftKeyPush;
	var isRightKeyPush;
	var isJumping;
	var isStand;

(function( window ){

	var js = document.createElement( 'script' );
	js.src = 'https://www.picomon.jp/game/get_solt.js';
	var fjs = document.getElementsByTagName( 'script' )[ 0 ];
	fjs.parentNode.insertBefore( js, fjs );

	var gameTimeLimit;

	var KEYCODE_ENTER;
	var KEYCODE_SPACE;
	var KEYCODE_LEFT;
	var KEYCODE_RIGHT;

	var floors;
	var canvas;
	var stage;
	var player;
	var itemList;
	var scoreField;
	var animation;
	var animate;
	var onKeyDown;
	var floorgroup;
	var f;
	var result;
	var whereFloor;
	var stockFloor;
	var overCheck;
	var stageFlag;
	var floorHeight;
	var roll;
	var loopRoll;
	var scoreBack;
	var gameFlame;
	var textOfTimeLimit;
	var playTime = 0;
	var prevDirFloor;
	var makeStageFloor;
	var itemResult;
	var makeStageItem;
	var click;
	var whereItem;
	var itemPos;
	var item;
	var timeCountDown;
	var commaScoreField;
	var sec;
	var resultStock;
	
	var preload;
	var manifest;
	var itemMessage;
	var messageField;
	

	function init() {
		if ( !createjs.Sound.initializeDefaultPlugins() || createjs.Sound.BrowserDetect.isIOS || createjs.Sound.BrowserDetect.isAndroid )
				return $("#error").css( "display", "block" );

		gameTimeLimit = 60 * 100;
		KEYCODE_ENTER = 13;
		KEYCODE_SPACE = 32;
		KEYCODE_LEFT  = 37;
		KEYCODE_RIGHT = 39;
		
		window.animation  = "";
		window.animate    = "";
		item              = "";
		loadingInterval   = 0;
		floorgroup        = [];
		f                 = 1;
		whereFloor        = 1;
		stockFloor        = 0;
		overCheck         = 0;
		stageFlag         = false;
		floorHeight       = 170;
		roll              = 0;
		loopRoll          = 0;
		gameFlame         = 0;
		prevDirFloor      = 0;
		makeStageFloor    = 0;
		makeStageItem     = 0;
		click             = true;
		itemList          = [];
		whereItem         = 0;
		itemPos           = 0;
		itemResult        = "";
		isSpacePush       = false;
		isLeftKeyPush     = false;
		isRightKeyPush    = false;
		isJumping         = false;
		isStand           = true;
		commaScoreField   = "";
		timeCountDown     = 99;
		
		$( "#canvasShowArea" ).css( "display", "block" );
		
		canvas = document.getElementById( "gameCanvas" );
		stage = new createjs.Stage( canvas );
		
		messageField = new createjs.Text( "Not found game loading", "bold 24px Arial", "#666666" );
		messageField.maxWidth  = 1000;
		messageField.textAlign = "center";
		messageField.x = canvas.width / 2;
		messageField.y = canvas.height - 90;
		stage.addChild( messageField );
		stage.update();
		
		var manifest = [
			{ id:"bgm", src:"./music/bgm.mp3|./music/bgm.ogg" },
			{ id:"dead", src:"./music/dead.mp3|./music/dead.ogg" },
			{ id:"jump", src:"./music/jump.mp3|./music/jump.ogg" },
			{ id:"item", src:"./music/item_get.mp3|./music/item_get.ogg" },
			{ id:"gameover", src:"./music/gameover.mp3|./music/gameover.ogg" },
			{ id:"timeover", src:"./music/timeover.mp3|./music/timeover.ogg" },
			
			{ src:"./img/back_1.jpg", id:"bg1" },
			{ src:"./img/back_2.jpg", id:"bg2" },
			{ src:"./img/back_3.jpg", id:"bg3" },
			{ src:"./img/back_4.jpg", id:"bg4" },
			{ src:"./img/back_5.jpg", id:"bg5" },
			{ src:"./img/img_player.png", id:"player" }
		];
		
		preload = new createjs.LoadQueue();
		preload.installPlugin( createjs.Sound );
		preload.loadManifest( manifest );
		
		preload.addEventListener( "complete", doneLoading );
		preload.addEventListener( "progress", updateLoading );
		
		setupSound();
	}
		
	function stop() {
		if ( preload !== null ) preload.close();
		createjs.Sound.stop();
	}
	
	function updateLoading () {
		if ( preload.progress < 1) {
				messageField.text = "ロード中 " + ( preload.progress * 100 | 0 ) + "%"
		stage.update();
		} else if ( preload.progress == 1 ) {
				messageField.text = "404 Not Found Game　=> Click Start";
		}
	}
		
	function doneLoading( event ) {
		scoreBack = new createjs.Bitmap( "./img/img_count_03.png" );
		scoreBack.x = canvas.width - 163;
		scoreBack.y = canvas.height - 135;
		
		scoreField = new createjs.Text( "0", "bold 50px Arial", "#ed6b6b" );
		scoreField.textAlign = "right";
		scoreFloor = new createjs.Text( "floor", "bold 25px Arial", "#ed6b6b" );
		scoreFloor.textAlign = "right";
		textOfTimeLimit = new createjs.Text( "残り時間 60:", "18px Arial", "#FFFFFF" );
		
		scoreField.maxWidth  = 1000;
		scoreField.x = canvas.width - 80;
		scoreField.y = canvas.height - 93;
		scoreFloor.x = canvas.width - 20;
		scoreFloor.y = canvas.height - 70;
		textOfTimeLimit.x = canvas.width - 130;
		textOfTimeLimit.y = canvas.height - 25;
		
		watchRestart();
	}

	function watchRestart() {
		stage.update();
		if ( playTime !== 0 ) {
			$( '#canvasShowArea' ).css( "background", "url( ./img/title.jpg )" );
		}
		if (click) canvas.onclick = handleClick;
	}

	function handleClick() {
		$( '#canvasShowArea' ).css ( "background" , "url(./img/back_1.jpg)" );
		click = false;
		canvas.onclick = null;
		restart();
	}

	function restart() {
		stage.removeAllChildren();

		stage.addChild( scoreBack );
		scoreField.text = ( 0 );
		stage.addChildAt( scoreField, 1 );
		stage.addChildAt( scoreFloor, 1 );
		stage.addChildAt( textOfTimeLimit, 1 );
		
		player = new Player();
		animation = player.getAnimation();
		player.addChild( animation );
		
		floorgroup[ 0 ] = new FloorGroup( 476, 1 );
		floors = floorgroup[ 0 ].getfloor();
		for ( var i = 0; i < floors.length; i++ ) {
			stage.addChildAt( floors[ i ], 0 );
		}
		createjs.Ticker.setFPS( 30 );
		
		stage.addChildAt( player , 8 );
		
		createjs.Sound.stop();
		createjs.Sound.play( "bgm", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.4 );
		
		makeStage();
		makeItem();
		
		createjs.Ticker.addEventListener( "tick", tick );
	}

	function makeStage() {
		while ( makeStageFloor < 500 ) {
			floorgroup[ f ] = new FloorGroup( 646 - ( f + 1 ) * 170, f + 1  );
			floors = floorgroup[ f ].getfloor();
			for ( var i = 0; i < floors.length; i++ ) {
				stage.addChildAt( floors[ i ] ,0 );
			}
			makeStageFloor++;
			f++;
		}
	}

	function makeItem() {
		while ( makeStageItem < 510 ) {
			if ( makeStageItem%10 === 0 ) {
				item = new Item( floorgroup[ makeStageItem ].collection[ 0 ].children[ 0 ].y - 255 );
				itemList.push( item );
				itemPos = item.getItemPosition();
				stage.addChildAt( item );
			}
			makeStageItem++;
		}
	}
	
	function commaCount( count ) {
		if ( count < 10 ) {
				return String( "0" + count );
		} else {
				return String( count );
		}
	}

	function tick ( event ) {
		gameFlame++;
		gameTimeLimit -= 3;
		textOfTimeLimit.text = ( "残り時間 " + Number( Math.floor(gameTimeLimit / 100) ) + ":" + commaCount( gameTimeLimit % 100 ) );
		if ( gameTimeLimit < 0 ) {
			isStand = false;
			createjs.Sound.stop();
			createjs.Sound.play( "timeover" );
			viewShareScore( Number( scoreField.text ) );
		}
	
		whereFloor = player.getWhere();
		if ( whereFloor > -1 ) player.setFloorY( floorgroup[ whereFloor ].collection[ 0 ].floorImage.y );
		if ( whereFloor > -1 ) result = floorgroup[ whereFloor ].isCollisionCheck( player, animation.y );

		if (result) {
			player.setVy( 0 );
			player.setCollision();
			if ( whereFloor === stockFloor + 1 ) {
				setNextStage();
				addScore( 1 );
			}
			stockFloor = whereFloor;
		} else if (!result) {
			player.setVy( 5*( ( 1/2 )^2 ) );
			player.setNotCollision();
		}
		
		itemResult = itemList[ whereItem ].isCollisionCheckItem( animation.x, animation.y );
		if (itemResult) resultStock = true;
		
		if ( itemResult ) {
			createjs.Sound.play( "item" );
			gameTimeLimit += 5 * 100;
			item.removeItem();
			sec = new Sec( itemList[ whereItem ].itemImage.x, itemList[ whereItem ].itemImage.y );
			whereItem += 1;
			stage.addChildAt( sec );
			setTimeout( function() {
				sec.removeSec();
			}, 2000 );
		}
		
		if ( canvas.height < itemList[ whereItem ].itemImage.y ) {
			item.removeItem();
			whereItem += 1;
		}

		if ( stage.canvas.clientHeight - 50 < animation.y ) {
			if ( overCheck === 0 ) {
				createjs.Sound.stop();
				isStand = false;
				createjs.Sound.play( "gameover" );
				overCheck = 1;
				setTimeout( viewShareScore( Number( scoreField.text ) ), 5000 );
			}
		}

		if ( stageFlag ) {
			roll += 17;
			$( '#canvasShowArea' ).css( "background-position","0px " + ( roll ) + "px" );
			animation.y += 17;
			isStand = false;
			for ( var j = 0; j < floorgroup.length; j++ ) {
				for ( var k = 0; k < floorgroup[ j ].collection.length; k++ ) {
					floorgroup[ j ].collection[ k ].floorImage.y += 17;
				}
			}
			
			for (var a in itemList){
				itemList[a].moveItemPositionY( 17 );
			}
			
			if ( resultStock ) {
				sec.moveSecPositionY( 17 );
			}
			
			
			if (roll == loopRoll) {
				stageFlag = false;
			}
		}

		stage.update();
	}

	function setNextStage() {
		stageFlag = true;
		loopRoll += floorHeight;
	}

	function addScore ( value ) {
		scoreField.text = ( Number( scoreField.text ) + Number( value ) );
		if ( scoreField.text == 16 ) {
			$( '#canvasShowArea' ).css( "background", "url( ./img/back_2.jpg )" );
		} else if ( scoreField.text == 25 ) {
			$( '#canvasShowArea' ).css( "background", "url( ./img/back_3.jpg )" );
		} else if ( scoreField.text == 40 ) {
			$( '#canvasShowArea' ).css( "background", "url( ./img/back_4.jpg )" );
		} else if ( scoreField.text == 47 ) {
			$( '#canvasShowArea' ).css( "background", "url( ./img/back_5.jpg )" );
		}
	}

	function getCookie ( name ) {
		if ( !name || !document.cookie ) return;
		var cookies = document.cookie.split( "; " );
		for ( var i = 0; i < cookies.length; i++ ) {
			var str = cookies[ i ].split( "=" );
			if ( str[ 0 ] != name ) continue;
			return unescape( str[ 1 ] );
		}
	}

	function setCookie ( name, value, domain, path, expires, secure ) {
		if ( !name ) return;
		var str = name + "=" + escape( value );
		if ( domain ) {
			if ( domain == 1 ) domain = location.hostname;
			str += "; domain=" + domain;
		}
		if ( path ) {
			if ( path == 1 ) path = location.pathname;
			str += "; path=" + path;
		}
		if ( expires ) {
			var nowtime = new Date().getTime();
			expires = new Date(nowtime + ( 60 * 60 * 24 * 1000 * expires ));
			expires = expires.toGMTString();
			str += "; expires=" + expires;
		}
		if ( secure && location.protocol == "https:" )  str += "; secure";
		document.cookie = str;
	}
	
	function setupSound() {
		var isSound      = getCookie( 'sound' );
		var $sound       = $( "#sound" );
		var $switchSound = $( "#switchSound" );
		$switchSound.on( "change", function( event ) {
			if ( $switchSound.is( ':checked' )) {
				setCookie( 'sound', 'on', 1, '/', 1 );
				createjs.Sound.setMute( false );
				$sound.attr( 'data-status', 'on' );
				return false;
			} else {
				setCookie( 'sound', 'off', 1, '/', 1 );
				createjs.Sound.setMute( true );
				$sound.attr( 'data-status', 'off' );
				return false;
			}
		});

		if ( isSound === 'off' ) $switchSound.click();
	}

	var HAS_SHARESCORE_SET_EVENT = false;
	function viewShareScore ( score ) {
		createjs.Ticker.removeEventListener( "tick", tick );
		for (var fr = 0;fr < floors.length;fr ++){
				floors[fr].removeAllChildren();
		}
		item.removeAllChildren();
		stage.removeAllChildren();

		var overlayElm             = $( "#overlay" );
		var shareScoreOverlayElm   = $( '#shareScoreOverlay' );
		var shareScoreCloseElm     = $( '#shareScoreClose' );
		var nickNameInputElm       = $( '#nickNameInput' );
		var scoreInputElm          = $( '#scoreInput' );
		var sendScoreButtonElm     = $( '#sendScoreButton' );
		var twitterShareButtonElm  = $( '#twitterShareButton' );
		var facebookShareButtonElm = $( '#facebookShareButton' );
		var innerRankingElm        = $( '#innerRanking' );
		var sendScoreFormElm       = $( '#sendScoreForm' );
		var scoreTextElm           = $( '#scoreText' );
		var rankInElm              = $( '#rankIn' );
		var rankInScoreElm         = $( '#rankInScore' );
		
		overlayElm.css( "display", "block" );
		shareScoreOverlayElm.css( "display", "block" );
		sendScoreFormElm.css( "display", "block" );
		scoreTextElm.css( "display", "block" );
		innerRankingElm.css( "display", "none" );

		scoreInputElm.val( score );

		if ( HAS_SHARESCORE_SET_EVENT ) return;
		HAS_SHARESCORE_SET_EVENT = true;

		overlayElm.click( function ( event ) {
			overlayElm.css( "display", "none" );
			shareScoreOverlayElm.css( "display", "none" );
			playTime++;
			init();
		});
		shareScoreCloseElm.click( function ( event ) {
			overlayElm.css( "display", "none" );
			shareScoreOverlayElm.css( "display", "none" );
			playTime++;
			init();
		});

		sendScoreButtonElm.click( function ( event ) {
			window._picomon_savedScore = function ( data ) {
				innerRankingElm.css( "display", "block" );
				sendScoreFormElm.css( "display", "none" );
				scoreTextElm.css( "display", "none" );
				if ( data.rank !== 0 && data.rank <= 10 ) {
					rankInElm.css( "display", "block" );
					rankInScoreElm.text( data.rank + '位' );
				} else {
					rankInElm.css( "display", "none" );
				}
				for ( var r in data.ranking ) {
					try {
						var rankObj = JSON.parse( data.ranking[r] );
						if ( +r+1 > 3 ) document.getElementById( 'innnerRankingNo_' + r ).innerHTML = +r+1;
						document.getElementById( 'innnerRankingName_' + r ).innerHTML  = rankObj.nickname;
						document.getElementById( 'innnerRankingScore_' + r ).innerHTML = rankObj.score;
					} catch ( e ) {
						continue;
					}
				}
			};

			var solt = ( typeof window.__404_picomon_solt__ === 'function' ) ? __404_picomon_solt__() : '';
			var js2 = document.createElement( 'script' );
			var sc  = parseInt( document.getElementById( 'scoreInput' ).value, 10 );
			js2.src = 'https://www.picomon.jp/game/set_score?data=' + Base64.encodeURI( solt + Base64.encodeURI( JSON.stringify( {
				callback: '_picomon_savedScore',
				type:     'escape404',
				score:    ( sc === 0 ) ? 1 : sc, // <--- 0ポイントだとエラーなのでバリでする
				nickname: encodeURIComponent( nickNameInputElm.val() )
			} ) ) );
			var fjs2 = document.getElementsByTagName( 'script' )[ 0 ];
			fjs2.parentNode.insertBefore( js2, fjs2 );
			js2.onload = function () {
				fjs2.parentNode.removeChild( js2 );
			};
		});

		twitterShareButtonElm.click( function ( event ) {
			var postMessage = encodeURIComponent( 'ピコもん 404ゲームで' + document.getElementById( 'scoreInput' ).value + '階まで登った！' );
			window.open( 'https://twitter.com/intent/tweet?hashtags=picomon&original_referer=http%3A%2F%2F404.picomon.jp%2F&text=' + postMessage + '&tw_p=tweetbutton&url=http%3A%2F%2F404.picomon.jp%2F&related=picomon_jp', null, 'width=400,height=300' );
		});

		facebookShareButtonElm.click( function ( event ) {
			var facebookShare = function() {
				window.open(
					'https://www.facebook.com/sharer.php?src=bm&v=4&i=1374645413&u='+
					encodeURIComponent( location.href )+
					'&t=' + encodeURIComponent( 'ピコもん 404ゲームで' + document.getElementById( 'scoreInput' ).value + '階まで登った！' ),
					'sharer',
					'toolbar=0,status=0,resizable=1,width=626,height=436'
				);
			};
			if ( /Firefox/.test( navigator.userAgent ) ) {
				setTimeout( facebookShare, 0 );
			} else {
				facebookShare();
			}
		});
	}
	window.onload = init;
}( window ));
