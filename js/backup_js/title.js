
var createTitleScene = function() {
	var titleScene = new Scene();
	titleScene.backgroundColor = BACKGROUND_COLOR;
	
	var startimage = new Sprite ( SCREEN_WIDTH, SCREEN_HEIGHT );
	startimage.image = global.game.assets[ IMAGE_START ];
	startimage.addEventListener ( Event.TOUCH_START, function(e) {
		global.game.replaceScene( createGameScene() ); 
	});
	titleScene.addChild(startimage);
	return titleScene;
};

	//ゲームオーバのシーン
var createGameOverScene = function() {
	var gameoverScene = new Scene();
	gameoverScene.backgroundColor = BACKGROUND_COLOR;

	global.sound.end.play("none",0,0,-1);
	var background = new Sprite( BACKGROUND_WIDTH - 220 , BACKGROUND_HEIGHT  );
	background.image = global.game.assets[ IMAGE_BACKGROUND ];
	background.addEventListener ( Event.TOUCH_START, function(e) {
		global.game.replaceScene( createTitleScene() );
		global.sound.end.stop();
	});
	gameoverScene.addChild( background );

	//右の枠
	var oth = new Sprite( 220, 540);
	oth.image = global.game.assets[ IMAGE_OTH ];
	oth.x = 740;
	oth.y = 0;
	gameoverScene.addChild( oth );

	//スコア登録用のモーダル
	//０点でなければ表示する
	if (global.score > 0 ) {
		$(".score_modal").show();
		var $picoCount = $('.score_modal .score_body .game_score');
		$picoCount.val(global.score);
	}
	var close_inp = $('.score_modal .close');
		close_inp.on('click', function() {
			$(".score_modal").hide();
		} );
	var inputEntry = $('.score_modal .btn-primary');
	inputEntry.on('click', function() {
		// 1 ニックネームが入ってませんよerror表示を消す
		$('.score_modal .score_body .error_area').hide();
		// 2 ニックネームが入ってるかチェックする
		var nickname = $('.score_modal .score_body .Pname').val();
		if (nickname === '' ) {
			// ニックネームが入ってませんよerror表示を出す
			$('.score_modal .score_body .error_area').show();
			return false;
		}
		// 問題なければサーバに送る
		ranking_comu(global.score, nickname, function ( data ) {
			if (data.error == 1 ) {
				var inputError = $('.ranking_modal .callback_error');
				inputError.show();
				$(".ranking_modal .score_body").hide();
				$(".ranking_modal .score_footer").hide();
			}
			//更新したランキングの表示
			$('.ranking_modal .score_header #rank ').text(data.rank);
			_.each(data.ranking, function(rnk,i){
				try {
					rnk = JSON.parse( rnk );
				} catch ( e ) {
					return;
				}
				$('.ranking_modal .score_body .score_' + i + ' .score_point ').text(rnk.score);
				$('.ranking_modal .score_body .score_' + i + ' .name ').text(rnk.nickname);	
			} );
			$(".score_modal").hide();
			$(".ranking_modal").show();		
		} );
	} );
	//SNS連携のボタン
	var twitterShareButtonElm = $('.ranking_modal .score_footer #twitterShareButton');
	twitterShareButtonElm.click( function ( event ) {
		var postMessage = encodeURIComponent( 'ピコもん 404ゲームで' + global.score + 'ピコ消しました！' );
		window.open( 'https://twitter.com/intent/tweet?hashtags=picomon&original_referer=http%3A%2F%2F404.picomon.jp%2F&text=' + postMessage + '&tw_p=tweetbutton&url=http%3A%2F%2F404.picomon.jp%2F&related=picomon_jp', null, 'width=400,height=300' );
	} );

	var facebookShareButtonElm = $('.ranking_modal .score_footer #facebookShareButton');
	facebookShareButtonElm.click( function ( event ) {
		var facebookShare = function() {
			window.open(
				'https://www.facebook.com/sharer.php?src=bm&v=4&i=1374645413&u='+
				encodeURIComponent( location.href )+
				'&t=' + encodeURIComponent( 'ピコもん 404ゲームで' + global.score + 'ピコ消しました！' ),
				'sharer',
				'toolbar=0,status=0,resizable=1,width=626,height=436'
			);
		};
		if ( /Firefox/.test( navigator.userAgent ) ) {
			setTimeout( facebookShare, 0 );
		} else {
			facebookShare();
		}
	} );

	var close_rnk = $('.ranking_modal .close');
	close_rnk.on('click', function() {
		$(".ranking_modal").hide();
	} );

	var retrylabel = new Label( global.score + "ピコです");
	retrylabel.textAlign = 'center';
	retrylabel.color =  'black';
	retrylabel.x = (BACKGROUND_WIDTH - 220)/3;
	retrylabel.y = 300;
	retrylabel.font = '20px sans-serif';
	retrylabel.text = "クリックしてタイトルへ";

	gameoverScene.addChild(retrylabel);

	//サーバーとの通信する関数
	function ranking_comu ( score, name, callback ){
		window._picomon_savedScore = callback;

		var solt = ( typeof window.__404_picomon_solt__ === 'function' ) ? __404_picomon_solt__() : '';
		var js = document.createElement( 'script' );
		js.src = 'https://www.picomon.jp/game/set_score?data=' + Base64.encodeURI( solt + Base64.encodeURI( JSON.stringify( {
			callback: ' _picomon_savedScore',
			type:	  'puzpico',
			score:    score,
			nickname: encodeURIComponent( name )
		} ) ) );
		var fjs = document.getElementsByTagName( 'script' )[ 0 ];
		fjs.parentNode.insertBefore( js, fjs );
		js.onload = function () {
			fjs.parentNode.removeChild( js );
		};
	}
	return gameoverScene;
};
