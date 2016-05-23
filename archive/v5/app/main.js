var easeljs       = require( 'easeljs' ),
	tweenjs       = require( 'tweenjs' ),
	soundjs       = require( 'soundjs' ),
	preloadjs     = require( 'preloadjs' ),
	$             = require( 'jquery' );

var StaticBitmap  = require( './static_bitmap' ),
	User          = require( './user' ),
	DynamicBitmap = require( './dynamic_bitmap' ),
	SushiClass    = require( './sushi_class' ),
	Music         = require( './music_notes' ),
	userKeyStatus = require( './key_status' );

( function( window ) {
	//スコア送受信用jsの読み込み
	var js = document.createElement( 'script' );
	js.src = 'https://www.picomon.jp/game/get_solt.js';
	var fjs = document.getElementsByTagName( 'script' )[ 0 ];
	fjs.parentNode.insertBefore( js, fjs );
	
	var userData,
		KEYCODE_SPACE      = 32,
		GAMEFRAME          = 60, //フレームレート
		ONE_FRAMERATE_TIME = 1 / GAMEFRAME * 1000, //1フレームの時間
		ONE_MEASURE_TIME   = 60 / 140 * 2 * 1000, // 1小節の時間(ms)
		SUSHI_SPEED        = 901 / ONE_MEASURE_TIME * ONE_FRAMERATE_TIME, //1フレームに移動するpx数
		CANVAS_WIDTH       = 960, // 描画画面全体の横幅
		JUDGE_AREA_FRAME   = {  
			MISS: { 
				INSIDE:  10,
				OUTSIDE: 13
			},   /* 判定エリアの表示 */
			BAD: {
				INSIDE:  8,
				OUTSIDE: 9
			},
			GOOD: {
				INSIDE:   5,
				OUTSIDE : 7
			},
			AWESOME: {
				INSIDE: 2,
				OUTSIDE: 3
			},
			PERFECT: {
				INSIDE: 0,
				OUTSIDE : 1
			}
		},
		messageField,			//loading中のメッセージオブジェクト(createjs.Text)
		scoreMessageField,		//ユーザーの得点表示オブジェクト(createjs.Text)
		judgeMessageField,		//ユーザーのメッセージオブジェクト(createjs.Text)
		comboMessageField,
		bgmInstance,			//プレイ中のbgmのオブジェクト(createjs.Sound)
		canvas,					//canvasのDOMエレメント
		stage,					//createjsのstageオブジェクト
		sushiArea,
		bitmapPlayingLines,
		bitmapPlayingJudgeArea,
		musicNotes,
		waitingSushi,
		loadingInterval = 0,
		sushiNeta = 'sushi_1',
		bitmapResultRegistButton,
		rankedUserData = [],
		preload;

	function init() {
		userData       = new User();
		rankedUserData = [];
		musicNotes     = new Music();
		waitingSushi   = [];
		canvas = document.getElementsByClassName( 'gameCanvas' )[ 0 ];
		bgmInstance = '';

		stage = new createjs.Stage( canvas );
		stage.enableMouseOver();
		stage.width = canvas.width;
		createjs.Touch.enable( stage );
		
		messageField = new createjs.Text( 'Not found game loading', 'bold 24px Arial', '#666666' );
		messageField.maxWidth  = 1000;
		messageField.textAlign = 'center';
		messageField.x = canvas.width / 2;
		messageField.y = canvas.height - 90;
		stage.addChild( messageField );

		stage.update();

		var manifest = [
			//プリロードsoundデータ
			{ id: 'start_bgm', src:'./music/start_bgm.mp3' },
			{ id: 'playing_bgm', src:'./music/playing_bgm.mp3' },
			{ id: 'playing_track', src:'./music/trackSE.mp3' },
			
			//プリロードイメージデータ
			//タイトル画面用
			{ id: 'start_background', src:'./img/start_background.jpg' },
			{ id: 'start_button', src:'./img/start_button.png' },
			{ id: 'start_mie', src:'./img/start_mie.png'},
			{ id: 'start_title', src:'./img/start_title.png'},
			
			//プレイ画面用
			{ id: 'playing_background', src:'./img/playing_background.jpg'},
			{ id: 'playing_table', src:'./img/playing_table.jpg'},
			{ id: 'playing_lines', src:'./img/playing_lines.png'},
			{ id: 'playing_cover', src:'./img/playing_cover.png'},
			{ id: 'playing_mie_normal_1', src:'./img/playing_mie_nomarl_1.png'},
			{ id: 'playing_judge_area', src:'./img/playing_judge_area.png'},
			{ id: 'playing_num', src:'./img/playing_num.png'},
			{ id: 'sushi_1', src:'./img/sushi_1.png'},
			{ id: 'sushi_2', src:'./img/sushi_2.png'},
			{ id: 'sushi_3', src:'./img/sushi_3.png'},
			{ id: 'sushi_4', src:'./img/sushi_4.png'},
			{ id: 'sushi_5', src:'./img/sushi_5.png'},
			{ id: 'sushi_6', src:'./img/sushi_6.png'},

			//結果画面用 
			{ id: 'result_title', src:'./img/result_title.png'},
			{ id: 'result_facebook', src:'./img/result_facebook.png'},
			{ id: 'result_twitter', src:'./img/result_twitter.png'},
			{ id: 'result_one_more_button', src:'./img/result_one_more_button.png'},
			{ id: 'result_regist_button', src:'./img/result_regist_button.png'},
			{ id: 'result_string_combo', src:'./img/result_string_combo.png'},
			{ id: 'result_string_rank', src:'./img/result_string_rank.png'},
			{ id: 'result_string_score', src:'./img/result_string_score.png'}
		];

		preload = new createjs.LoadQueue();
		preload.installPlugin( createjs.Sound );
		preload.addEventListener( 'complete', doneLoading );
		preload.addEventListener( 'progress', updateLoading );
		preload.addEventListener( 'error', errorLoading );
		preload.loadManifest( manifest );
		setupSound();

	} //END OF init()

	//loading中
	function updateLoading () {
		messageField.text = 'ロード中 ' + ( preload.progress * 100 | 0 ) + '%';
		stage.update();
	}

	//loadingエラー時
	function errorLoading() {
		messageField.text = 'ファイルの読み込みに失敗しました。更新ボタンを押してください。';
		stage.update();
	}

	//loading終了時
	function doneLoading() {
		clearInterval( loadingInterval );		
		stage.removeChild( messageField );
		var preLoadedStartBackground = preload.getResult('start_background');
		var preLoadedStartMie        = preload.getResult('start_mie');
		var preLoadedStartTitle      = preload.getResult('start_title');
		var preLoadedStartButton     = preload.getResult('start_button');

		createjs.Sound.play( 'start_bgm' , { loop : -1 } );
		var bitmapStartBackground    = new StaticBitmap(preLoadedStartBackground);
		var bitmapStartMie    = new StaticBitmap(preLoadedStartMie);
		var bitmapStartTitle  = new StaticBitmap(preLoadedStartTitle);
		var bitmapStartButton = new DynamicBitmap(preLoadedStartButton);
		bitmapStartMie.setCordinate( { x : 50 , y : 47 } );
		bitmapStartTitle.setCordinate( { x : 186 , y : 122 } );
		bitmapStartButton.setCordinate( { x : 250 , y : 444 } );
		bitmapStartButton.cursor = 'pointer';

		stage.addChild(bitmapStartBackground);
		stage.addChild(bitmapStartMie);
		stage.addChild(bitmapStartTitle);
		stage.addChild(bitmapStartButton);
		stage.update();
		stage.addEventListener('click', gamePlay);
	
	}


	//プレイ画面を表示
	function gamePlay() {
		stage.removeEventListener('click', gamePlay); //クリックしたらgamePlayを起動するを外す
		stage.removeAllChildren();
		createjs.Ticker.init();
		createjs.Ticker.setFPS(GAMEFRAME); //tickerのフレームレートの設定
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Sound.removeSound( 'start_bgm' );


		
		var preLoadedPlayingBackground = preload.getResult('playing_background'),
			bitmapPlayingBackground    = new StaticBitmap(preLoadedPlayingBackground);

		var preLoadedPlayingMieNormal  = preload.getResult('playing_mie_normal_1'),
			bitmapPlayingMieNormal     = new DynamicBitmap( preLoadedPlayingMieNormal );
		
		bitmapPlayingMieNormal.setCordinate( { x : 23 , y : 220 } );
		
		var preLoadedPlayingTable      = preload.getResult('playing_table'),
			bitmapPlayingTable         = new StaticBitmap( preLoadedPlayingTable );
		
		bitmapPlayingTable.setCordinate( { x : 0 , y : 436 } );

		sushiArea = new createjs.Container();
		sushiArea.x = 0;
		sushiArea.y = 476;

		var preLoadedPlayingLines      = preload.getResult('playing_lines');
		bitmapPlayingLines        = new DynamicBitmap( preLoadedPlayingLines );
		bitmapPlayingLines.width = bitmapPlayingLines.getBounds().width;
		
		var preLoadedPlayingJudgeArea      = preload.getResult('playing_judge_area');
		bitmapPlayingJudgeArea         = new StaticBitmap( preLoadedPlayingJudgeArea );
		bitmapPlayingJudgeArea.setCordinate( { x : 59 , y : 479 } );

		var preLoadedPlayingCover      = preload.getResult('playing_cover'),
			bitmapPlayingCover         = new StaticBitmap( preLoadedPlayingCover );
		bitmapPlayingCover.setCordinate( { x : 578 , y : 452.5 } );
		
		//プレイ画面の準備
		stage.addChild(bitmapPlayingBackground);
		stage.addChild(bitmapPlayingMieNormal);
		stage.addChild(bitmapPlayingTable);
		stage.addChild(sushiArea);
		sushiArea.addChild(bitmapPlayingLines);
		stage.addChild(bitmapPlayingJudgeArea);
		stage.addChild(bitmapPlayingCover);
		
		//判定のテキスト表示
		judgeMessageField = new createjs.Text( 'コンボ 0皿', 'bold 32px Arial', '#FFF' );
		judgeMessageField.textAlign = 'left';
		stage.addChild(judgeMessageField);

		//現在スコアのテキスト表示
		scoreMessageField = new createjs.Text( '0', 'bold 32px Arial', '#FFF' );
		scoreMessageField.width  = 376;
		scoreMessageField.textAlign = 'right';
		scoreMessageField.x = 569;
		scoreMessageField.y = 580;
		stage.addChild(scoreMessageField);

		//コンボ数のテキスト表示
		comboMessageField = new createjs.Text( '0皿', 'bold 32px Arial', '#CE2939' );
		comboMessageField.width  = 376;
		comboMessageField.textAlign = 'left';
		comboMessageField.x = 60;
		comboMessageField.y = 580;
		stage.addChild(comboMessageField);

		bgmInstance = new createjs.Sound.createInstance( 'playing_bgm' );
		bgmInstance.addEventListener('complete', showResult );//曲が終わったらtickを終了
		
		document.addEventListener('keydown', handleKeyDown, false);
		document.addEventListener('keyup', handleKeyUp, false);
		
		//スペースキーを押した際のスクロールの無効
		window.onkeydown = function(e) {
			if (e.keyCode == 32 && e.target == document.body) e.preventDefault();
		};
		
		stage.addEventListener('mousedown', handleClickDown);
		stage.addEventListener('pressup', handleClickUp);
		
		stage.update();
		if ( !createjs.Ticker.hasEventListener( 'tick' ) ){ 
			bgmInstance.play();
			createjs.Ticker.addEventListener( 'tick', tick ); 
		}
		
		
	}

	//userContorol系にまとめたい
	function handleKeyDown(event){
		if ( event.keyCode !== KEYCODE_SPACE ) return false;
		
		userKeyStatus.pressSpaceHeld();
		createjs.Sound.play( 'playing_track' );
	}
	//userContorol系にまとめたい
	function handleKeyUp ( event ) {
		if ( event.keyCode !== KEYCODE_SPACE ) return false;
		
		userKeyStatus.upSpaceHeld();
	}
	//userContorol系にまとめたい
	function handleClickDown () {
		userKeyStatus.pressClickHeld();
		createjs.Sound.play( 'playing_track' );
	}

	//userContorol系にまとめたい
	function handleClickUp () {
		userKeyStatus.upClickHeld();
	}


	//音量のON OFF
	function setupSound() {
		var $sound       = $( '#sound' );
		var $switchSound = $( '#switchSound' );
		$switchSound.on( 'change', function() {
			var isChecked   = $switchSound.is( ':checked' ),
				soundStatus = isChecked ? 'on' : 'off';

			createjs.Sound.setMute( isChecked );
			$sound.attr( 'data-status', soundStatus );

			return false;
		});
	}
	
	function tick ( event ) {
		// update graphic
		stage.update( event );

		// update combo		
		showCurrentScore( userData.getUserScore() );
		showCombo( userData.getCurrentCombo() );

		// コンベアの移動 
		moveBelt();
		
		// 寿司の判定状態
		judge( userKeyStatus.isPlay );

		// チック時間の取得と音楽の現在の再生時間の取得
		var currentTime = bgmInstance.getPosition();

		// 寿司の描画と移動
		if( musicNotes.notes[0] - ONE_MEASURE_TIME <= currentTime ) drawSushi();
		moveSushi();
		
		// 判定エリアの透過
		judgeAreaChangeColor( userKeyStatus.isSpaceHeld || userKeyStatus.isTapHeld || userKeyStatus.isClickHeld ); //後に他のキーも追加
	}

	function drawSushi() {
		var currentCombo   = userData.getCurrentCombo();
		
		var isComboLevel_1 = 0 <= currentCombo && currentCombo < 10; //10combo未満
		if (isComboLevel_1)  sushiNeta = 'sushi_1';

		var isComboLevel_2 = 10 <= currentCombo && currentCombo < 25; //25combo未満
		if (isComboLevel_2)  sushiNeta = 'sushi_2';

		var isComboLevel_3 = 25 <= currentCombo && currentCombo < 50; //50combo未満
		if (isComboLevel_3)  sushiNeta = 'sushi_3';

		var isComboLevel_4 = 50 <= currentCombo && currentCombo < 80; //80combo未満
		if (isComboLevel_4)  sushiNeta = 'sushi_4';

		var isComboLevel_5 = 80 <= currentCombo && currentCombo < 115; //115combo未満
		if (isComboLevel_5)  sushiNeta = 'sushi_5';

		var isComboLevel_6 = 115 <= currentCombo && currentCombo < 155; //120combo未満
		if (isComboLevel_6)  sushiNeta = 'sushi_6';
		

		var sushi = new SushiClass( preload.getResult( sushiNeta ) ) ;
		sushi.timing = musicNotes.notes.shift();
		sushi.x = CANVAS_WIDTH;
		sushi.vX = SUSHI_SPEED;
		sushi.isAbleJudge = false;
		sushiArea.addChild(sushi);
		waitingSushi.push( sushi );
	}

	function moveSushi() {
		if( !waitingSushi.length ) return;
		
		waitingSushi.forEach( function( drawingSushi ){
			drawingSushi.tick();
		} );
	}

	function deleteSushi(judgingSushi) { 
		sushiArea.removeChild(judgingSushi);
	}

	function effectSushi(judgeStatus) {
		var judgingSushi           = waitingSushi.shift(),
			judgingSushiSize       = judgingSushi.getBounds(),
			tweenSushi             = createjs.Tween.get(judgingSushi,{override:true}),
			tweenJudge             = createjs.Tween.get(judgeMessageField,{override:true});
			
		judgeMessageField.text = judgeStatus;
		tweenSushi.regX        = judgingSushiSize.width / 2;
		tweenSushi.regY        = judgingSushiSize.height / 2;

		var animateSuShiConfig = {
			MISS:    { color: '#050000', effect: downSushi },
			BAD:     { color: '#6861B5', effect: downSushi },
			GOOD:    { color: '#6DB561', effect: upSushi },
			AWESOME: { color: '#B3B561', effect: upSushi },
			PERFECT: { color: '#B56161', effect: upSushi }
		};

		var config = animateSuShiConfig[ judgeStatus ];

		if ( config ) {
			setTweenJudge( config.color );
			config.effect( judgingSushi );
		}
		function setTweenJudge ( color ) {
			tweenJudge.set( { color: color, alpha: 0, x:190, y: 315 } ).to( { alpha:1 }, 100 ).to( { alpha:0 }, 400 );
		}

		function downSushi ( judgingSushi ) {
			tweenSushi.to( { rotation : 180, alpha:0, y: judgingSushi.y + 100 }, 600 ).call( function() {
				deleteSushi( judgingSushi );
			} );
		}

		function upSushi ( judgingSushi ) {
			tweenSushi.to( { scaleX: 0, scaleY: 0, alpha:0,y: -100 }, 600 ).call( function(){
				deleteSushi( judgingSushi );
			});
		}
	}

	//ベルトをひたすら流す
	function moveBelt(){
		bitmapPlayingLines.x -= SUSHI_SPEED ;
		if (bitmapPlayingLines.x < - bitmapPlayingLines.width + stage.width ) {
			bitmapPlayingLines.x = 0;
		}
	}


	function judge(isPlay) {
		var length = waitingSushi.length;

		if(length) {
			
			var currentTime = bgmInstance.getPosition ();
			var relativeTime = Math.abs(currentTime - waitingSushi[0].timing);
			checkIsAbleJudge( currentTime, isPlay, waitingSushi[0].isAbleJudge );
			if(isPlay && waitingSushi[0].isAbleJudge) {
				var judgeStatus = checkJudge(relativeTime);
				if( judgeStatus ) effectSushi(judgeStatus); //ジャッジステータスが返されたらエフェクトをかける。
				checkSuccessPlay(judgeStatus);
				if(judgeStatus) userData.incrementScore (judgeStatus);
			}

			//ボタンを押さずにスルーした時の処理
			if( !waitingSushi.length ) return;

			var isThroughSushi = currentTime > waitingSushi[0].timing + JUDGE_AREA_FRAME.MISS.OUTSIDE * ONE_FRAMERATE_TIME;
			if( !isThroughSushi ) return;
			
			judgeStatus = 'MISS';
			effectSushi(judgeStatus);
			checkSuccessPlay(judgeStatus);
			if(judgeStatus) userData.incrementScore (judgeStatus);
			
		}

	}

	function checkSuccessPlay(judgeStatus) {
		var isSuccess = judgeStatus == 'GOOD' || judgeStatus == 'AWESOME' || judgeStatus == 'PERFECT';
		userData.setIsSuccessPlay(isSuccess);
	}

	function checkIsAbleJudge(currentTime,isPlay) {
		//寿司がジャッジ可能ではなく、かつボタンも押しっぱなしではなく、かつ現在の時間が寿司の判定時間の内側にいるとき
		var isChangeAble = !waitingSushi[0].isAbleJudge && !isPlay &&  currentTime <= waitingSushi[0].timing + JUDGE_AREA_FRAME.MISS.OUTSIDE * ONE_FRAMERATE_TIME;
		if( isChangeAble ) waitingSushi[0].isAbleJudge = true;
	}

	function showCurrentScore(currentScore) {
		scoreMessageField.text = 'スコア ' + currentScore;
	}

	function showCombo(currentCombo) {
		comboMessageField.text = 'コンボ ' + currentCombo +'皿';
	}

	function checkJudge(relativeTime) {
		var missJudge = JUDGE_AREA_FRAME.MISS.INSIDE * ONE_FRAMERATE_TIME <= relativeTime && relativeTime <= JUDGE_AREA_FRAME.MISS.OUTSIDE * ONE_FRAMERATE_TIME;
		if( missJudge ) return 'MISS';

		var	badJudge  = JUDGE_AREA_FRAME.BAD.INSIDE * ONE_FRAMERATE_TIME <= relativeTime && relativeTime <= JUDGE_AREA_FRAME.BAD.OUTSIDE * ONE_FRAMERATE_TIME;
		if( badJudge ) return 'BAD';

		var goodJudge = JUDGE_AREA_FRAME.GOOD.INSIDE * ONE_FRAMERATE_TIME<= relativeTime &&  relativeTime <= JUDGE_AREA_FRAME.GOOD.OUTSIDE * ONE_FRAMERATE_TIME;
		if( goodJudge ) return 'GOOD';

		var awesomeJudge = JUDGE_AREA_FRAME.AWESOME.INSIDE * ONE_FRAMERATE_TIME <= relativeTime && relativeTime <= JUDGE_AREA_FRAME.AWESOME.OUTSIDE * ONE_FRAMERATE_TIME;
		if( awesomeJudge ) return 'AWESOME';

		var perfectJudge = JUDGE_AREA_FRAME.PERFECT.INSIDE * ONE_FRAMERATE_TIME <= relativeTime && relativeTime <= JUDGE_AREA_FRAME.PERFECT.OUTSIDE * ONE_FRAMERATE_TIME;
		if( perfectJudge ) return 'PERFECT';
		
		return '';//判定外

	}

	function judgeAreaChangeColor(isPlay) {
		isPlay ? bitmapPlayingJudgeArea.alpha = 1  : bitmapPlayingJudgeArea.alpha = 0.5;
	}


	function showResult() {
		createjs.Ticker.removeEventListener( 'tick', tick );
		document.removeEventListener('keydown', handleKeyDown, false);
		document.removeEventListener('keyup', handleKeyUp, false);
		stage.removeEventListener('mousedown', handleClickDown);
		stage.removeEventListener('pressup', handleClickUp);

		//背景
		var blackBackGround = new createjs.Shape();
		blackBackGround.alpha = 0.6;
		blackBackGround.graphics.beginFill('#000'); 
		blackBackGround.graphics.drawRect(0, 0, 960, 640);
		stage.addChild(blackBackGround);
		
		//タイトル表示
		var preLoadedResultTitle      = preload.getResult('result_title');
		var bitmapResultTitle         = new StaticBitmap( preLoadedResultTitle );
		bitmapResultTitle.setCordinate( { x : 629 , y : 10 } );
		stage.addChild( bitmapResultTitle );
		
		//ランキング登録
		var preLoadedResultRegistButton      = preload.getResult('result_regist_button');
		bitmapResultRegistButton         = new StaticBitmap( preLoadedResultRegistButton );
		
		var isSP = userData.getUA() == 'sp' || userData.getUA() == 'tab';
		bitmapResultRegistButton.setCordinate( { x : 565 , y : 300 } );
		if(isSP) bitmapResultRegistButton.setCordinate( { x : 324 , y : 450 } );
		stage.addChild( bitmapResultRegistButton );
		bitmapResultRegistButton.addEventListener('click', function(){ 
			ranking_comu( userData.getUserScore(),$( '.resultInputName input' ).val() ,showRanking );
		} );
		//テキストフィールドの表示
		$( '.resultInputName' ).toggleClass('off').toggleClass( 'on' );

		//twitterとfacebook表示
		//twitter
		var preLoadedResultTwitter      = preload.getResult('result_twitter'),
			bitmapResultTwitter         = new StaticBitmap( preLoadedResultTwitter );
		
		bitmapResultTwitter.setCordinate( { x : 788 , y : 554 } );
		bitmapResultTwitter.cursor = 'pointer';
		stage.addChild( bitmapResultTwitter );
		bitmapResultTwitter.addEventListener('click', shareTwitter);
		//facebook
		var preLoadedResultFacebook      = preload.getResult('result_facebook'),
			bitmapResultFacebook         = new StaticBitmap( preLoadedResultFacebook );
		
		bitmapResultFacebook.cursor = 'pointer';
		bitmapResultFacebook.setCordinate( { x : 870 , y : 554 } );
		stage.addChild( bitmapResultFacebook );
		bitmapResultFacebook .addEventListener('click', shareFacebook );


		//スコア表示
		//'スコア'という文字列の表示
		var preLoadedResultStringScore      = preload.getResult('result_string_score');
		var bitmapResultStringScore         = new StaticBitmap( preLoadedResultStringScore );
		bitmapResultStringScore.setCordinate( { x : 234 , y : 44 } );
		stage.addChild( bitmapResultStringScore );
		//ユーザーの得点の表示
		var resultScoreText = new createjs.Text( userData.getUserScore() + '円' , 'bold 51px Arial', '#FFF' );
		resultScoreText.textAlign = 'left';
		resultScoreText.x = 369;
		resultScoreText.y = 38;
		stage.addChild( resultScoreText );

		//最大コンボ表示
		//'コンボ'という文字列の表示
		var preLoadedResultStringCombo      = preload.getResult('result_string_combo');
		var bitmapResultStringCombo         = new StaticBitmap( preLoadedResultStringCombo );
		bitmapResultStringCombo.setCordinate( { x : 234 , y : 126 } );
		stage.addChild( bitmapResultStringCombo );
		//最大コンボの表示
		var resultMaxComboText = new createjs.Text( userData.getMaxCombo(), 'bold 51px Arial', '#FFF' );
		resultMaxComboText.textAlign = 'left';
		resultMaxComboText.x = 369;
		resultMaxComboText.y = 120;
		stage.addChild( resultMaxComboText );

		//もう１度ボタンの表示
		var preLoadedResultOneMoreButton      = preload.getResult('result_one_more_button');
		var bitmapResultOneMoreButton         = new StaticBitmap( preLoadedResultOneMoreButton );
		bitmapResultOneMoreButton.setCordinate( { x : 324 , y : 552 } );
		bitmapResultOneMoreButton.cursor = 'pointer';
		bitmapResultOneMoreButton.addEventListener('click', function(){ 
			restart( bitmapResultOneMoreButton );
		} );
		stage.addChild( bitmapResultOneMoreButton );
		stage.update();
	}
	function ranking_comu ( score, name, callback ){

		if( name == '' ) {
			$('.resultInputName input').val('').attr('placeholder' ,'名前を入力してから登録ボタンを押してください。');
			return;
		}

		window._picomon_savedScore = callback;
		var solt = ( typeof window.__404_picomon_solt__ === 'function' ) ? __404_picomon_solt__() : '';
		var js2 = document.createElement( 'script' );

		js2.src = 'https://www.picomon.jp/game/set_score?data=' + Base64.encodeURI( solt + Base64.encodeURI( JSON.stringify( {
			callback: '_picomon_savedScore',
			type:     'shingen_sushi',
			score:    ( score === 0 ) ? 1 : score, // <--- 0ポイントだとエラーなのでバリでする
			nickname: encodeURIComponent( name )
		} ) ) );
		var fjs2 = document.getElementsByTagName( 'script' )[ 0 ];
		fjs2.parentNode.insertBefore( js2, fjs2 );
		js2.onload = function () {
			fjs2.parentNode.removeChild( js2 );
		};

	}

	function restart(  ) {
		location.reload();
	}

	function shareFacebook() {
		window.open(
			'https://www.facebook.com/sharer.php?src=bm&v=4&i=1374645413&u='+
			encodeURIComponent( location.href )+
			'&t=' + encodeURIComponent( 'ピコもん 404ゲームで' + userData.getUserScore() + '円分の寿司を食べた！！' ),
			'sharer',
			'toolbar=0,status=0,resizable=1,width=626,height=436'
		);
	}

	function shareTwitter() {
		var postMessage = encodeURIComponent( 'ピコもん 404ゲームで' + userData.getUserScore() + '円分の寿司を食べた！！' );
		window.open( 'https://twitter.com/intent/tweet?hashtags=picomon&original_referer=http%3A%2F%2F404.picomon.jp%2F&text=' + postMessage + '&tw_p=tweetbutton&url=http%3A%2F%2F404.picomon.jp%2F&related=picomon_jp', null, 'width=400,height=300' );
	}

	function showRanking ( data ) {
		if( $( '.resultInputName' ).hasClass( 'on' ) ) $( '.resultInputName' ).addClass( 'off' ).removeClass( 'on' );
		stage.removeChild( bitmapResultRegistButton );
		stage.update();
		var rankingArea = new createjs.Container();
		rankingArea.x = 128;
		rankingArea.y = 231;
		if(!data.error) 
			data.ranking.forEach(function(rankedDataJson,index){
				var rankedData   = JSON.parse( rankedDataJson ),
					rankNumber   = index + 1;
				var isRankOver5th     = 5 < rankNumber && rankNumber <= 10,
					validateName = rankedData.nickname.length > 6 ? rankedData.nickname.substr(0,5) + '...' : rankedData.nickname;
			
				var displayRankingData = {
					container : new createjs.Container(),
					rank      : new createjs.Text( rankNumber+'位', 'bold 30px Arial', '#FFF' ),
					name      : new createjs.Text( validateName, 'bold 28px Arial', '#FFF' ),
					score     : new createjs.Text( rankedData.score, 'bold 26px Arial', '#FFF' )
				};

				displayRankingData.rank.textAlign = 'right';
				displayRankingData.name.textAlign = 'right';
				displayRankingData.score.textAlign = 'right';

				displayRankingData.rank.maxWidth = 70;
				displayRankingData.name.x        = 200;
				displayRankingData.name.maxWidth = 200;
				displayRankingData.score.x       = 300;
				
				rankedUserData.push( displayRankingData );
				rankedUserData[index].container.addChild( rankedUserData[index].rank ,rankedUserData[index].name,rankedUserData[index].score);
				var verticalPosition                = (rankedUserData[index].container.getBounds().height + 23) * (index % 5) ;
				rankedUserData[index].container.y   = verticalPosition;
				rankingArea.addChild( rankedUserData[index].container );
				if(isRankOver5th ) rankedUserData[index].container.x = 400;
			});
		stage.addChild( rankingArea );
		stage.update();
	}


	window.onload = init;
} )( window );
