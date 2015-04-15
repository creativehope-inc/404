$(document).ready(function(){

	// #################################################
	//                     インポート
	// #################################################

	// ゲームの設定など
	var game      = window.game.game,
		setting   = window.game.setting,
		files     = window.game.files,
		store     = window.game.store,
		playerArr = window.game.playerArr,
		enemyArr  = window.game.enemyArr,
		itemArr   = window.game.itemArr;

	// スーパーの設定
	var SuperLabel = window.super.SuperLabel,
		SuperSprite = window.super.SuperSprite,
		SuperBackground = window.super.SuperBackground,
		SuperScene = window.super.SuperScene,
		SuperImage = window.super.SuperImage;

	// サブクラスの設定
	var Aircraft = window.sub.Aircraft,
		Player = window.sub.Player,
		Enemy = window.sub.Enemy,
		ZakoEnemy = window.sub.ZakoEnemy,
		ZakoEnemy2 = window.sub.ZakoEnemy2,
		BossEnemyHead = window.sub.BossEnemyHead,
		BossEnemyBody = window.sub.BossEnemyBody,
		BossEnemyHeadRibbon = window.sub.BossEnemyHeadRibbon,
		BossEnemyBodyRibbon  = window.sub.BossEnemyBodyRibbon,
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

		// 音楽データの保存
		var sound = game.assets[files.mainSound].clone();
		sound.src.loop = true;
		sound.play();
		sound.preMusic = store.music; // 過去のデータを保存する

		// ########################################################
		//            　　　　シーンの設定
		// ########################################################
		// ゲームに関する
		//　全ての管理処理をルートsceneで行う(シーンに依存しない)	
		game.rootScene.addEventListener('enterframe', function() {

			// 音楽の切り替え処理
			if (sound.preMusic != store.music) {
				(store.music) ? sound.play() : sound.pause();
				sound.preMusic = store.music;
			}

			// カレントシーンの判断
			if (store.currentScene == 'gamestart') {
				// 開始
				game.pushScene(playGameFn());
			}
		});

		// 背景画像
 		game.rootScene.addChild(
			new SuperBackground(
				setting.gameWidth,
				setting.gameHeight,
				files.title,
				null,
				null
			)
 		);

 		// ゲームスタートボタン
		game.rootScene.addChild (
			new SuperImage(
				291,
				55,
				340,
				420,
				null,
				files.startButton,
				function() {　// タッチ処理
					// ゲームスタート
					store.currentScene = 'gamestart';
				},
				null,
				null
			)
		);

 		// 音楽ボタン
		game.rootScene.addChild (
			new SuperImage(
				87,
				32/2,
				830,
				10,
				[2],
				files.soundButton,
				function() { // タッチ処理
					(store.music) ? store.music = false : store.music = true;
				},
				function() {　// フレーム処理
					// 音楽の切り替え
					(store.music) ? this.frame = [1] : this.frame = [2];
				},
				null
			)
		);

		// ########################################################
		//            プレイゲーム
		// ########################################################
		var playGameFn = function() {
			// 初期化処理
			store.startTime = ( game.frame / game.fps ) .toFixed ( 2 ) ;
			store.playerHitpoint = setting.playerHitpoint;
			store.playerAgility = setting.playerAgility;
			store.gamePoint = 0;
			store.gameTime = 0;
			store.flag = false;
			store.zakoEnemyCounter = 0;
			store.zakoEnemy2Counter=  0;
			store.bossHeadCounter= 0;
			store.bossHeadRibonCounter= 0;
			store.bossBodyCounter= 0;
			store.bossBodyRibonCounter= 0;

			// スクリーンの生成
			var flag = 1; // ボス出現フラグ
			var playGame = new SuperScene(
				setting.gameWidth,
				setting.gameHeight,
				null,
				// 背景やラベル用
				[
					new SuperBackground(
						setting.gameWidth,
						setting.gameHeight,
						files.background,
						function() {
						    // スクロール
					        this.x -= 3;
						    // 端まで行ったら戻す
						    if (this.x <= -setting.gameWidth) {
						        this.x = setting.gameWidth -10; // 間が空くのでちょっと詰める
						    }
						},
						null
					),
					new SuperBackground(
						setting.gameWidth,
						setting.gameHeight,
						files.background,
						function() {
							// スクロール
							this.x -= 3;
							// 端まで行ったら戻す
							if (this.x <= -setting.gameWidth) {
								this.x = setting.gameWidth -10; // 間が空くのでちょっと詰める
							}
						},
						function() {
							this.x = setting.gameWidth;
						}
					),
					new SuperLabel( // ゲーム時間
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
							this.text = 'Time: ' + ( 120 - store.gameTime );
						}
					),
					new SuperLabel( // ヒットポイント
						150,
						10,
						null,
						null,
						'blue',
						setting.labelFontSize,
						null,
						function() {
							this.text = 'HP: ' + store.playerHitpoint + ',';
						}
					),
					new SuperLabel( // スピード
						220,
						10,
						null,
						null,
						'green',
						setting.labelFontSize,
						null,
						function() {
							this.text = 'Speed: ' + store.playerAgility + ',';
						}
					),
					new SuperLabel( // スコア
					 	340,
					 	10,
					 	null,
					 	null,
					 	'orange',
					 	setting.labelFontSize,
					 	null,
					 	function() {
							this.text = 'Score: ' + store.gamePoint;
					 	}
					)
				],
				// フレーム処理
				function() {
					// 敵小用
					if (store.gameTime < 10) {
						// 敵を出現させる(zako敵)
						if (game.frame % 15 == 0) {
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

					// 敵中用
					if (store.gameTime > 5 && store.gameTime < 10) {
						// 敵を出現させる(zako敵)
						if (game.frame % 25 == 0) {
							new ZakoEnemy2(
								setting.gameWidth - Math.floor(Math.random() * (30-20) + 20),
								Math.floor(Math.random()*(setting.gameHeight-0)+0),
								game.frame,
								playGame
							).saveStore(enemyArr); // 敵の保存処理
						}
					}
					
					// 敵ボス表示
					if (store.gameTime >= 10 && store.gameTime < 120 && flag == 1) {
						// ボスの体
						new BossEnemyBody(
							500,
							220,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理
						// ボスの頭
						new BossEnemyHead(
							515,
							150,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理
						// ボスの頭のリボン
						new BossEnemyHeadRibbon(
							515,
							120,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理
						// ボスの体のリボン
						new BossEnemyBodyRibbon(
							540,
							240,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理

						flag = 0;
					}

					// 時間アウト
					if (store.gameTime > 120) {
						// ゲームオーバーscenes
						console.log('時間が過ぎましたゲームオーバー');
						store.currentScene = 'gameover';
					}

					// 勝利モード
					if (store.bossHeadCounter == 1 &&
						store.bossHeadRibonCounter == 1 &&
						store.bossBodyCounter == 1 &&
						store.bossBodyRibonCounter == 1) {
						store.currentScene = 'gameclear';
					}

					// ゲームオーバー処理
					if (store.currentScene == 'gameover' || 
						store.currentScene == 'gameclear') {

						// ゲームオーバーscene
						if (store.music) sound.stop();
						var gameOverSound = game.assets[files.gameOverSound].clone();
						if (store.music) gameOverSound.play();
						// ゲームオーバーscene
						var gameOver = new SuperScene(
							setting.gameWidth,
							setting.gameHeight,
							(store.currentScene == 'gameover') ? 'black' : 'white', // 勝った場合は金色
							[
								new SuperLabel(
								 	340,
								 	150,
								 	null,
								 	null,
								 	(store.currentScene == 'gameover') ? 'white' : 'black',
								 	'45px cursive',
								 	(store.currentScene == 'gameover') ? 'GAME OVER': 'GAME CLEAR',　// 文言変更
								 	null
								),
								new SuperLabel(
								 	360,
								 	240,
								 	300,
								 	100,
								 	(store.currentScene == 'gameover') ? 'white' : 'black',
								 	'20px cursive',
								 	'',
								 	null,
								 	null,
								 	function() {
								 		this.text = '-----------撃破数----------<br>';
								 		this.text += '雑魚敵１:                      ' + store.zakoEnemyCounter + '体　<br>';
								 		this.text += '雑魚敵２:                      ' + store.zakoEnemy2Counter + '体 <br>';
								 		this.text += '敵ボス頭:                      ' + store.bossHeadCounter + '体　<br>';
								 		this.text += '敵ボス頭のリボン:          ' + store.bossHeadRibonCounter + '体 <br>';
								 		this.text += '敵ボス体:                      ' + store.bossBodyCounter + '体　<br>';
								 		this.text += '敵ボスの体のリボン:       ' + store.bossBodyRibonCounter + '体 <br>';
								 	}
								),
								new SuperLabel(
								 	350,
								 	400,
								 	300,
								 	100,
								 	(store.currentScene == 'gameover') ? 'white' : 'black',
								 	'35px cursive',
								 	'',
								 	null,
								 	null,
								 	function() {
								 		this.text = 'Score: ' + store.gamePoint + ' pt.';
								 	}
								)
							],
							null,
							function() { // タッチ処理
								game.popScene(playGame);
								game.popScene(gameOver);
								store.currentScene = '';
								if (store.music) sound.play();
							}
						);
						// ゲームオーバー
						game.pushScene(gameOver);
						// 色々初期化しよう
						for (key in enemyArr) {
							delete enemyArr[key];
						}
						for (key in playerArr) {
							delete playerArr[key];
						}
						for (key in itemArr) {
							delete itemArr[key];
						}
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
});