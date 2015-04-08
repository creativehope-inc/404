$(document).ready(function() {


	// #####################################
	//        　    インポート
	// #####################################
	var game =  window.game.game,
		setting = window.game.setting,
		image = window.game.image,
		store = window.game.store,
		playerArr = window.game.playerArr,
		enemyArr = window.game.enemyArr,
		itemArr = window.game.itemArr;


	game.onload = function() {

	// #####################################
	//        　   　ラベル
	// #####################################
		var SuperLabel = Class.create(Label, {
			// コンストラクタ
			initialize: function(x, y, width, height, color, font, text, callback) {
				Label.call(this, text); // 最初の位置
				// 一気にインスタンスプロパティのセット
				this.x = x;
				this.y = y;
				// Note: バグか分からないが、幅や高さを指定すると位置の指定ができなくなるので無効化(下２行)
				//this.width = width || 'auto';
				//this.height = height || 'auto';
				this.color = color;
				this.font = font;
				this.text = text || ''; // エラーが出る可能性があるので空文字を入れておく
				this.addEventListener('enterframe', function() {
					// イベントリスナーの処理はcallbackに保存する
					if (callback) callback();
				});
			}
		});


		// 対戦用のスプライト
		var bg1 = new Sprite(setting.gameWidth, setting.gameHeight);
		bg1.image  = game.assets["background1.png"];
		bg1.addEventListener('enterframe', function() {
			// 背景を動かす
			//this.x -= setting.playerAgility;
		});

		// ########################################################
		//                        メイン処理
		// ########################################################
		// #####################
		//      ラベル(文字)のインスタンス
		// ####################

		var welcomeMessage = new SuperLabel (
			250,
			setting.gameHeight /1.2,
			setting.gameWidth + 'px',
			'200px',
			'black',
			setting.labelFontSize,
			'ゲームを開始するいには画面をクリックしてください',
			null
		);

		var timeCounter = new SuperLabel(
			10,
			10,
			null,
			null,
			'red',
			setting.labelFontSize,
			null,
			function() {
				timeCounter.text = 'Time: ' + (game.frame / game.fps).toFixed(2) + '秒,';
			}
		);

		var hitpointCounter = new SuperLabel(
			150,
			10,
			null,
			null,
			'blue',
			setting.labelFontSize,
			null,
			function() {
				hitpointCounter.text = 'HP: ' + setting.playerHitpoint + ',';
			}
		);

		var speedCounter = new SuperLabel(
			220,
			10,
			null,
			null,
			'green',
			setting.labelFontSize,
			null,
			function() {
				speedCounter.text = 'Speed: ' + setting.playerAgility + ',';
			}
		);

		 var pointCounter = new SuperLabel(
		 	340,
		 	10,
		 	null,
		 	null,
		 	'orange',
		 	setting.labelFontSize,
		 	null,
		 	function() {
				pointCounter.text = 'Point: ' + setting.gamePoint;
		 	}
		 );

		 var gameOverMessage = new SuperLabel(
		 	300,
		 	250,
		 	null,
		 	null,
		 	'white',
		 	'50px cursive',
		 	'GAME OVER',
		 	null
		 );

	// エクスポート
	window.labels = {
		SuperLabel: SuperLabel,
		bg1: bg1,
		welcomeMessage: welcomeMessage,
		timeCounter: timeCounter,
		hitpointCounter: hitpointCounter,
		speedCounter: speedCounter,
		pointCounter: pointCounter,
		gameOverMessage : gameOverMessage
	};
}

});