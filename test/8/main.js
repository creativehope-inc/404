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
		SuperSprite = window.super.SuperSprite;

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

	// ゲーム読み込み時
	game.onload = function() {

		// #######################################################################
		//                        メイン処理
		// #######################################################################
		
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

		// #####################
		//     スプライト（背景）のインスタンス化
		// #####################
		// トップ用のスプライト
		var titleBackground = new Sprite(setting.gameWidth, setting.gameHeight);
		titleBackground.image  = game.assets["logo.png"];

		// 対戦用のスプライト
		var bg1 = new Sprite(setting.gameWidth, setting.gameHeight);
		bg1.image  = game.assets["background1.png"];

		// ########################################################
		//            　　　　シーンの設定
		// ########################################################

		// #####################
		//    rootシーン
		// #####################
		game.rootScene.addEventListener('touchstart', function() {
			game.pushScene(playGameFn());
			console.log(game);
		});
		game.rootScene.addChild(titleBackground); // <=========================
		game.rootScene.addChild(welcomeMessage); // 最初の文字列をつかする

		// ###################
		//   playGameシーン
		// ###################
		var playGame; // グローバルスコープで参照するためのオブジェクト
		var playGameFn = function() {

			// スクリーンの生成
			playGame = new Scene();
			playGame.width = setting.gameWidth;
			playGame.height = setting.gameHeight;
			playGame.addChild(bg1);
			playGame.addChild(timeCounter); // 時間の表示
			playGame.addChild(hitpointCounter); // ポイントの表示
			playGame.addChild(speedCounter); // HPを表示
			playGame.addChild(pointCounter); // ポイントの表示

			// プレイヤーインスタンスの作成
			var player = new Player(
				0,
				setting.gameHeight/2,
				game.frame,
				playGame // game context
			);
			player.saveStore(playerArr); // 出現データの保存

 			// ゲームが始まったら始めるタイマー処理
			playGame.addEventListener('enterframe', function() {
				// 現在時刻を保存
				var currentTime = (game.frame / game.fps).toFixed(2);
				// 一分以内ならファーストフェイズの処理をする
				if (currentTime < 60) {
					// 敵を出現させる(zako敵)
					if (game.frame % 50 == 0) {
						new ZakoEnemy(
							setting.gameWidth - Math.floor(Math.random() * (30-20) + 20),
							Math.floor(Math.random()*(setting.gameHeight-0)+0),
							game.frame, //UUID
							playGame
						).saveStore(enemyArr); // 敵の保存処理
					}
					// 敵を出現させる(zako敵)
					if (game.frame % 70 == 0) {
						new ZakoEnemy2(
							setting.gameWidth - Math.floor(Math.random() * (30-20) + 20),
							Math.floor(Math.random()*(setting.gameHeight-0)+0),
							game.frame, //UUID
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

				} else {
					// 終了処理
				}
				
			});
				// ゲームオーバー画面へ
			playGame.addEventListener('touchstart', function() {
				// ポーズ画面を表示させる
			});
				
			// プレイゲームインスタンスを返す
			return playGame;
		}


		// ###################
		//   game overシーン
		// ###################
		//var gameOverFn = function() {
			var gameOver = new Scene();
			gameOver.backgroundColor = 'black';
			gameOver.addChild(gameOverMessage);
			gameOver.addEventListener('touchstart', function() {
				game.popScene(playGame);
				game.popScene(gameOver);
				console.log('タッチしました2');
			});
			return gameOver;
		//}

	};
	game.start();

	/*
		参考文献
		http://www.slideshare.net/sidestepism/5-tlenchantjs
	*/

});