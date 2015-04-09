 $(document).ready(function(){

	// #################################################
	//                        インポート
	// #################################################

	// ゲームの設定など
	var game      = window.game.game,
		setting   = window.game.setting,
		image     = window.game.image,
		store     = window.game.store,
		playerArr = window.game.playerArr,
		enemyArr  = window.game.enemyArr,
		itemArr   = window.game.itemArr;

	// スーパーの設定
	var SuperLabel = window.super.SuperLabel,
		SuperSprite = window.super.SuperSprite,
		SuperBackground = window.super.SuperBackground,
		SuperScene = window.super.SuperScene;

	// サブクラスの設定
	var Aircraft = window.sub.Aircraft,
		Player = window.sub.Player,
		Enemy = window.sub.Enemy,
		ZakoEnemy = window.sub.ZakoEnemy,
		ZakoEnemy2 = window.sub.ZakoEnemy2,
		Things = window.sub.Things,
		Bullet = window.sub.Bullet,
		PlayerBullet = window.sub.PlayerBullet,
		EnemyBullet = window.sub.EnemyBullet,
		EnemyBullet2 = window.sub.EnemyBullet2,
		Item = window.sub.Item,
		RecoveryItem = window.sub.RecoveryItem,
		SpeedItem = window.sub.SpeedItem,
		Explosion = window.sub.Explosion,
		Cure = window.sub.Cure;


	// ####################
	//   ゲームの開始
	// ####################
	game.onload = main;
	game.start();

	// ####################
	//   メイン関数
	// ####################
	function main() {

		// ########################################################
		//            	       メッセージの処理
		// ########################################################
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
				// ゲームタイムを保存
				store.gameTime = ((game.frame / game.fps) - store.startTime).toFixed(2);
				timeCounter.text = 'Time: ' + store.gameTime + '秒,';
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
				hitpointCounter.text = 'HP: ' + store.playerHitpoint + ',';
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
				speedCounter.text = 'Speed: ' + store.playerAgility + ',';
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
				pointCounter.text = 'Point: ' + store.gamePoint;
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

		// ########################################################
		//            　　　　背景の設定
		// ########################################################
		var titleBackground = new SuperBackground(
			setting.gameWidth,
			setting.gameHeight,
			"logo.png"
		);

		var bg1 = new SuperBackground(
			setting.gameWidth,
			setting.gameHeight,
			"background1.png"
		);

		// ########################################################
		//            　　　　シーンの設定
		// ########################################################
		// rootシーン
		game.rootScene.addEventListener('touchstart', function() {
			// カレントシーンの判断
			if (store.currentScene == 'gamestart') {
				// 初期化する
				store.startTime = (game.frame / game.fps).toFixed(2);
				store.playerHitpoint = setting.playerHitpoint;
				store.playerAgility = setting.playerAgility;
				store.gamePoint = 0;
				store.gameTime = 0;
				// 開始
				game.pushScene(playGameFn());
			}
		});
		game.rootScene.addChild(titleBackground); // <=========================
		game.rootScene.addChild(welcomeMessage); // 最初の文字列をつかする

		// ########################################################
		//            プレイゲーム
		// ########################################################
		var playGameFn = function() {
			// スクリーンの生成
			var playGame = new SuperScene(
				setting.gameWidth,
				setting.gameHeight,
				null,
				[bg1, timeCounter, hitpointCounter, speedCounter, pointCounter],
				function() {
					// 一分以内ならファーストフェイズの処理をする
					if (store.gameTime < 60) {
						// 敵を出現させる(zako敵)
						if (game.frame % 50 == 0) {
							new ZakoEnemy(
								setting.gameWidth - Math.floor(Math.random() * (30-20) + 20),
								Math.floor(Math.random()*(setting.gameHeight-0)+0),
								game.frame + Math.floor(Math.random()*(10000-0)+0), //UUID
								playGame
							).saveStore(enemyArr); // 敵の保存処理
						}
						// 回復アイテムを出現
						if (game.frame % 100 == 0) {
							// 回復アイテムの出現
							new RecoveryItem(
								setting.gameWidth-30,
								Math.floor(Math.random()*(setting.gameHeight-0)+0),
								playGame
							);
						}
						// 速度アップアイテムを出現させる
						if (game.frame % 120 == 0) {
							// 速度アップアイテム
							new SpeedItem(
								setting.gameWidth-30,
								Math.floor(Math.random()*(setting.gameHeight-0)+0),
								playGame
							);
						}
					}

					// ゲームオーバー処理
					if (store.currentScene == 'gameover') {
						// ゲームオーバーscene
						var gameOver = new SuperScene(
							setting.gameWidth,
							setting.gameHeight,
							'black',
							[gameOverMessage, timeCounter, hitpointCounter, speedCounter, pointCounter],
							null,
							function() {
								game.popScene(playGame);
								game.popScene(gameOver);
								store.currentScene = 'gamestart';
							}
						);
						// ゲームオーバー
						game.pushScene(gameOver);
					}
				}
			);

			// プレイヤーインスタンスの作成
			var player = new Player(
				0,
				setting.gameHeight/2,
				game.frame + Math.floor(Math.random()*(10000-0)+0),
				playGame // game context
			);
			player.saveStore(playerArr); // 出現データの保存

			// プレイゲームインスタンスを返す
			return playGame;
		};


	};

	/*
		参考文献
		http://www.slideshare.net/sidestepism/5-tlenchantjs
	*/

});