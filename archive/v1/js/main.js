!function( window ){

	var js = document.createElement( 'script' );
	js.src = 'https://www.picomon.jp/game/get_solt.js';
	var fjs = document.getElementsByTagName( 'script' )[ 0 ];
	fjs.parentNode.insertBefore( js, fjs );

	var DIFFICULTY     = 4;
	var ROCK_TIME      = 110;
	var BULLET_TIME    = 5;
	var BULLET_ENTROPY = 100;

	var TURN_FACTOR   = 7;
	var BULLET_SPEED  = 17;

	var KEYCODE_ENTER = 13;
	var KEYCODE_SPACE = 32;
	var KEYCODE_UP    = 38;
	var KEYCODE_LEFT  = 37;
	var KEYCODE_RIGHT = 39;
	var KEYCODE_W     = 87;
	var KEYCODE_A     = 65;
	var KEYCODE_D     = 68;

	var shootHeld;
	var lfHeld;
	var rtHeld;
	var fwdHeld;
	var timeToRock;
	var nextRock;
	var nextBullet;
	var rockBelt;
	var bulletStream;
	var canvas;
	var stage;
	var ship;
	var alive;
	var messageField;
	var scoreField;

	var loadingInterval = 0;

	var preload;

	document.onkeydown = handleKeyDown;
	document.onkeyup   = handleKeyUp;

	var preload;

	window.onload = function () {
		if ( !createjs.Sound.initializeDefaultPlugins() || createjs.Sound.BrowserDetect.isIOS || createjs.Sound.BrowserDetect.isAndroid )
			return document.getElementById( "error" ).style.display  = "block";
		document.getElementById( "canvasShowArea" ).style.display = "block";

		canvas = document.getElementById( "gameCanvas" );
		stage = new createjs.Stage( canvas );
		messageField = new createjs.Text( "Not found game loading", "bold 24px Arial", "#FFF" );
		messageField.maxWidth  = 1000;
		messageField.textAlign = "center";
		messageField.x = canvas.width / 2;
		messageField.y = canvas.height / 2;
		stage.addChild( messageField );
		stage.update();

		var manifest = [
			{id:"begin",     src:"./music/start.mp3|./music/start.ogg"},
			{id:"break",     src:"./music/hit.mp3|./music/hit.ogg", data:6},
			{id:"heart_get", src:"./music/heart_get.mp3|./music/heart_get.ogg"},
			{id:"death",     src:"./music/dead.mp3|./music/dead.ogg"},
			{id:"laser",     src:"./music/shoot.mp3|./music/shoot.ogg", data:6},
			{id:"music",     src:"./music/bgm.mp3|./music/bgm.ogg"}
		];

		preload = new createjs.LoadQueue();
		preload.installPlugin( createjs.Sound );
		preload.addEventListener( "complete", doneLoading );
		preload.addEventListener( "progress", updateLoading );
		preload.loadManifest( manifest );

		setupSound();
	}

	function stop () {
		if ( preload != null ) preload.close();
		createjs.Sound.stop();
	}

	function updateLoading () {
		messageField.text = "ロード中 " + ( preload.progress * 100 | 0 ) + "%"
		stage.update();
	}

	function doneLoading( event ) {
		clearInterval( loadingInterval );
		scoreField = new createjs.Text( "0", "bold 16px Arial", "#FFFFFF" );
		scoreField.textAlign = "right";
		scoreField.maxWidth  = 1000;
		scoreField.x = canvas.width - 20;
		scoreField.y = 20;

		messageField.text = "404 Not Found Game　=> Click Start";

		watchRestart();
	}

	function watchRestart() {
		stage.addChild( messageField );
		stage.update();
		canvas.onclick = handleClick;
	}

	function handleClick() {
		canvas.onclick = null;
		stage.removeChild( messageField );
		restart();
	}

	function restart() {
		stage.removeAllChildren();
		scoreField.text = (0).toString();
		stage.addChild( scoreField );

		rockBelt     = new Array();
		bulletStream = new Array();

		alive  = true;
		ship   = new Ship();
		ship.x = canvas.width / 2;
		ship.y = canvas.height / 2;

		timeToRock = ROCK_TIME;
		nextRock   = nextBullet = 0;

		shootHeld =	lfHeld = rtHeld = fwdHeld = dnHeld = false;

		createjs.Sound.stop();
		createjs.Sound.play( "begin" );
		createjs.Sound.play( "music", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.4 );

		stage.clear();
		stage.addChild( ship );

		if ( !createjs.Ticker.hasEventListener( "tick" ) ) createjs.Ticker.addEventListener( "tick", tick );
	}

	function tick ( event ) {
		if ( nextBullet <= 0 ) {
			if ( alive && shootHeld ){
				nextBullet = BULLET_TIME;
				fireBullet();
			}
		} else {
			nextBullet--;
		}

		if ( alive && lfHeld ) {
			ship.rotation -= TURN_FACTOR;
		} else if ( alive && rtHeld ) {
			ship.rotation += TURN_FACTOR;
		}

		if ( alive && fwdHeld ) ship.accelerate();

		if ( nextRock <= 0 ) {
			if ( alive ) {
				timeToRock -= DIFFICULTY;
				var index = getSpaceRock( SpaceRock.LRG_ROCK );
				rockBelt[ index ].floatOnScreen( canvas.width, canvas.height );
				nextRock = timeToRock + timeToRock*Math.random();
			}
		} else {
			nextRock--;
		}

		if ( alive && outOfBounds( ship, ship.bounds ) ) placeInBounds( ship, ship.bounds );

		for( bullet in bulletStream ) {
			var o = bulletStream[ bullet ];
			if ( !o || !o.active ) continue;
			if ( outOfBounds( o, ship.bounds ) ) placeInBounds( o, ship.bounds );
			o.x += Math.sin( o.rotation * ( Math.PI / -180 ) ) * BULLET_SPEED;
			o.y += Math.cos( o.rotation * ( Math.PI / -180 ) ) * BULLET_SPEED;

			if ( --o.entropy <= 0 ) {
				stage.removeChild( o );
				o.active = false;
			}
		}

		for ( spaceRock in rockBelt ) {
			var o = rockBelt[ spaceRock ];
			if ( !o || !o.active ) continue;

			if ( outOfBounds( o, o.bounds ) ) placeInBounds(o, o.bounds);
			o.tick( event );


			if ( alive && o.hitRadius( ship.x, ship.y, ship.hit ) ) {
				if ( o.size == SpaceRock.SML_ROCK ) {
					addScore( 1000 );
					stage.removeChild( o );
					rockBelt[ spaceRock ].active = false;
					createjs.Sound.play( "heart_get", createjs.Sound.INTERUPT_LATE );
					continue;
				}
				alive = false;

				stage.removeChild( ship );
				messageField.text = "Game over!! またゲームをするには画面をクリックしてください";
				stage.addChild( messageField );
				watchRestart();
				viewShareScore( Number( scoreField.text ) );

				createjs.Sound.play( "death", createjs.Sound.INTERRUPT_ANY );
				continue;
			}

			for ( bullet in bulletStream ) {
				var p = bulletStream[ bullet ];
				if(!p || !p.active) continue;

				if ( o.hitPoint( p.x, p.y ) ) {
					var newSize;
					switch ( o.size ) {
						case SpaceRock.LRG_ROCK: newSize = SpaceRock.SML_ROCK;
							break;
						case SpaceRock.SML_ROCK: newSize = 0;
							break;
					}

					if ( newSize > 0 ) {
						var index = getSpaceRock( newSize );
						var offSet = ( Math.random() * o.size * 2 ) - o.size;
						rockBelt[ index ].x = o.x + offSet;
						rockBelt[ index ].y = o.y + offSet;
					}

					stage.removeChild( o );
					rockBelt[ spaceRock ].active = false;

					stage.removeChild( p );
					bulletStream[ bullet ].active = false;

					addScore( 100 );

					createjs.Sound.play( "break", createjs.Sound.INTERUPT_LATE, 0, 0.8 );
				}
			}
		}

		ship.tick( event );
		stage.update( event );
	}

	function outOfBounds ( o, bounds ) {
		return o.x < bounds*-2 || o.y < bounds*-2 || o.x > canvas.width+bounds*2 || o.y > canvas.height+bounds*2;
	}

	function placeInBounds ( o, bounds ) {
		if ( o.x > canvas.width + bounds * 2 ) {
			o.x = bounds * -2;
		} else if ( o.x < bounds * -2 ) {
			o.x = canvas.width + bounds * 2;
		}

		if ( o.y > canvas.height + bounds * 2 ) {
			o.y = bounds * -2;
		} else if ( o.y < bounds * -2 ) {
			o.y = canvas.height + bounds * 2;
		}
	}

	function fireBullet() {
		var o = bulletStream[ getBullet() ];
		o.x   = ship.x;
		o.y   = ship.y;
		o.rotation = ship.rotation + 90;
		o.entropy  = BULLET_ENTROPY;
		o.active   = true;

		createjs.Sound.play( "laser", createjs.Sound.INTERUPT_LATE );
	}

	function getSpaceRock ( size ) {
		var i = 0;
		var len = rockBelt.length;

		while ( i <= len ) {
			if ( !rockBelt[ i ] ) {
				rockBelt[ i ] = new SpaceRock( size );
				break;
			} else if ( !rockBelt[ i ].active ) {
				rockBelt[ i ].activate( size );
				break;
			} else {
				i++;
			}
		}

		if ( len == 0 ) rockBelt[ 0 ] = new SpaceRock( size );

		stage.addChild( rockBelt[ i ] );
		return i;
	}

	function getBullet() {
		var i = 0;
		var len = bulletStream.length;

		while ( i <= len ) {
			if ( !bulletStream[ i ] ) {
				bulletStream[ i ] = new createjs.Bitmap( './img/heart_shoot.png' );
				break;
			} else if ( !bulletStream[ i ].active ) {
				bulletStream[ i ].active = true;
				break;
			} else {
				i++;
			}
		}

		if ( len == 0 ) {
			bulletStream[ 0 ] = new createjs.Bitmap( './img/heart_shoot.png' );
		}

		stage.addChild( bulletStream[ i ] );
		return i;
	}

	function handleKeyDown ( e ) {
		if ( !e ) { var e = window.event; }
		switch ( e.keyCode ) {
			case KEYCODE_SPACE:	shootHeld = true; return false;
			case KEYCODE_LEFT:	lfHeld    = true; return false;
			case KEYCODE_RIGHT: rtHeld    = true; return false;
			case KEYCODE_UP:	fwdHeld   = true; return false;
			case KEYCODE_ENTER:	 if ( canvas.onclick == handleClick ){ handleClick(); } return false;
		}
	}

	function handleKeyUp ( e ) {
		if ( !e ) { var e = window.event; }
		switch ( e.keyCode ) {
			case KEYCODE_SPACE:	shootHeld = false; break;
			case KEYCODE_LEFT:	lfHeld    = false; break;
			case KEYCODE_RIGHT: rtHeld    = false; break;
			case KEYCODE_UP:	fwdHeld   = false; break;
		}
	}

	function addScore ( value ) {
		scoreField.text = ( Number( scoreField.text ) + Number( value ) ).toString();
	}

	function minusScore ( value ) {
		scoreField.text = ( Number( scoreField.text ) - Number( value ) ).toString();
		if ( Number( scoreField.text ) < 0 ) scoreField.text = (0).toString();
	}

	function getCookie ( name ) {
		if ( !name || !document.cookie ) return;
		var cookies = document.cookie.split( "; " );
		for ( var i = 0; i < cookies.length; i++ ) {
			var str = cookies[ i ].split( "=" );
			if ( str[0] != name ) continue;
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
			expires = new Date(nowtime + (60 * 60 * 24 * 1000 * expires));
			expires = expires.toGMTString();
			str += "; expires=" + expires;
		}
		if (secure && location.protocol == "https:")  str += "; secure";
		document.cookie = str;
	}

	function setupSound () {
		var isSound        = getCookie( 'sound' );
		var soundElm       = document.getElementById( 'sound' );
		var switchSoundElm = document.getElementById( 'switchSound' );
		soundElm.onclick = function ( event ) {
			if ( soundElm.getAttribute( 'data-status' ) === 'on' ) {
				setCookie( 'sound', 'off', 1, '/', 1 );
				createjs.Sound.setMute( true );
				soundElm.setAttribute( 'data-status', 'off' );
				switchSoundElm.checked = false;
				return false;
			}
			setCookie( 'sound', 'on', 1, '/', 1 );
			createjs.Sound.setMute( false );
			soundElm.setAttribute( 'data-status', 'on' );
			switchSoundElm.checked = true;
			return false;
		};
		if ( isSound === null || isSound === 'on' ) {
			createjs.Sound.setMute( false );
			soundElm.setAttribute( 'data-status', 'on' );
			switchSoundElm.checked = true;
		} else if ( isSound === 'off' ) {
			createjs.Sound.setMute( true );
			soundElm.setAttribute( 'data-status', 'off' );
			switchSoundElm.checked = false;
		}
	}

	var HAS_SHARESCORE_SET_EVENT = false;
	function viewShareScore ( score ) {

		var overlayElm             = document.getElementById( 'overlay' );
		var shareScoreOverlayElm   = document.getElementById( 'shareScoreOverlay' );
		var shareScoreCloseElm     = document.getElementById( 'shareScoreClose' );
		var nickNameInputElm       = document.getElementById( 'nickNameInput' );
		var scoreInputElm          = document.getElementById( 'scoreInput' );
		var sendScoreButtonElm     = document.getElementById( 'sendScoreButton' );
		var twitterShareButtonElm  = document.getElementById( 'twitterShareButton' );
		var facebookShareButtonElm = document.getElementById( 'facebookShareButton' );
		var innerRankingElm        = document.getElementById( 'innerRanking' );
		var sendScoreFormElm       = document.getElementById( 'sendScoreForm' );
		var scoreTextElm           = document.getElementById( 'scoreText' );
		var rankInElm              = document.getElementById( 'rankIn' );
		var rankInScoreElm         = document.getElementById( 'rankInScore' );

		overlayElm.style.display           = 'block';
		shareScoreOverlayElm.style.display = 'block';

		sendScoreFormElm.style.display     = 'block';
		scoreTextElm.style.display         = 'block';
		innerRankingElm.style.display      = 'none';

		scoreInputElm.value = score;

		if ( HAS_SHARESCORE_SET_EVENT ) return;
		HAS_SHARESCORE_SET_EVENT = true;

		overlayElm.onclick = function ( event ) {
			overlayElm.style.display = 'none';
			shareScoreOverlayElm.style.display = 'none';
		};
		shareScoreCloseElm.onclick = function ( event ) {
			overlayElm.style.display = 'none';
			shareScoreOverlayElm.style.display = 'none';
		};

		sendScoreButtonElm.onclick = function ( event ) {
			var u = '';
			try {
				if ( !window.localStorage ) throw 0;
				var z = window.localStorage.getItem( '__pcmnz' );
				z = JSON.parse( z );
				u = z.userId;
			} catch ( e ) {}

			window._picomon_savedScore = function( data ) {
				innerRankingElm.style.display  = 'block';
				sendScoreFormElm.style.display = 'none';
				scoreTextElm.style.display     = 'none';
				if ( data.rank !== 0 && data.rank <= 10 ) {
					rankInElm.style.display  = 'block';
					rankInScoreElm.innerHTML = data.rank + '位';
				} else {
					rankInElm.style.display = 'none';
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
			var sc  = Number( scoreField.text );
			js2.src = 'https://www.picomon.jp/game/set_score?data=' + Base64.encodeURI( solt + Base64.encodeURI( JSON.stringify( {
				callback: '_picomon_savedScore',
				type:     'first404',
				score:    ( sc === 0 ) ? 1 : sc, // <--- 0ポイントだとエラーなのでバリでする
				nickname: encodeURIComponent( nickNameInputElm.value )
			} ) ) );
			var fjs2 = document.getElementsByTagName( 'script' )[ 0 ];
			fjs2.parentNode.insertBefore( js2, fjs2 );
			js2.onload = function () {
				fjs2.parentNode.removeChild( js2 );
			};
		};

		twitterShareButtonElm.onclick = function ( event ) {
			var postMessage = encodeURIComponent( 'ピコもん 404ゲームで' + document.getElementById( 'scoreInput' ).value + 'スコアを獲得した！' );
			window.open( 'https://twitter.com/intent/tweet?hashtags=picomon&original_referer=http%3A%2F%2F404.picomon.jp%2F&text=' + postMessage + '&tw_p=tweetbutton&url=http%3A%2F%2F404.picomon.jp%2F&related=picomon_jp', null, 'width=400,height=300' );
		};

		facebookShareButtonElm.onclick = function ( event ) {
			var a = function() {
				window.open(
					'https://www.facebook.com/sharer.php?src=bm&v=4&i=1374645413&u='
						+ encodeURIComponent( location.href )
						+ '&t=' + encodeURIComponent( 'ピコもん 404ゲームで' + document.getElementById( 'scoreInput' ).value + 'スコアを獲得した！' ),
					'sharer',
					'toolbar=0,status=0,resizable=1,width=626,height=436'
				);
			};
			if ( /Firefox/.test( navigator.userAgent ) ) {
				setTimeout( a, 0 );
			} else {
				a();
			}
		};
	}

}( window );
