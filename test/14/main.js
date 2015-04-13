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
		SuperScene = window.super.SuperScene;

	// サブクラスの設定
	var Aircraft = window.sub.Aircraft,
		Player = window.sub.Player,
		Enemy = window.sub.Enemy,
		ZakoEnemy = window.sub.ZakoEnemy,
		ZakoEnemy2 = window.sub.ZakoEnemy2,
		BossEnemyHead = window.sub.BossEnemyHead,
		BossEnemyBody = window.sub.BossEnemyBody,
		BossEnemyHeadRibon = window.sub.BossEnemyHeadRibon,
		BossEnemyBodyRibon  = window.sub.BossEnemyBodyRibon,
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
		sound.play();
		var kako = store.music; // 過去のデータを保存する

		// ########################################################
		//            　　　　シーンの設定
		// ########################################################
		// ゲームに関する
		//　全ての管理処理をルートsceneで行う(シーンに依存しない)	
		game.rootScene.addEventListener('enterframe', function() {

			// 音楽の切り替え処理
			if (kako != store.music) {
				console.log('音楽変更');
				(store.music) ? sound.play() : sound.pause();
				kako = store.music;
			}

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
		// rootシーン
		game.rootScene.addChild(
			new SuperBackground(
				setting.gameWidth,
				setting.gameHeight,
				"logo.png"
			)
		);
		game.rootScene.addChild (
			new SuperLabel (
				390,
				400,
				setting.gameWidth + 'px',
				'200px',
				'red',
				'50px cursive',
				'スタート',
				null,
				function() { // タッチ処理
					// ゲームスタート
					store.currentScene = 'gamestart';
				},
				null // ワンタイム処理
			)
		);
		game.rootScene.addChild (
			new SuperLabel (
				750,
				10,
				setting.gameWidth + 'px',
				'200px',
				'white',
				'40px cursive',
				'音量ON/OFF',
				function(self) {
					// 音楽の切り替え
					self.text = 'Sound ' + ( (store.music) ? 'On' : 'Off') ;
				},
				function(self) {
					// 音楽の切り替え
					(store.music) ? store.music = false : store.music = true;
				},
				function(self) { // ワンタイム処理(スタイルの変更)
					//self.id  = 'start_button';
				}
			)
		);
		// ########################################################
		//            プレイゲーム
		// ########################################################
		var playGameFn = function() {
			// スクリーンの生成
			var flag = 1;
			var playGame = new SuperScene(
				setting.gameWidth,
				setting.gameHeight,
				null,
				// 背景やラベル用
				[
					new SuperBackground(
						setting.gameWidth,
						setting.gameHeight,
						'background1.png',
						function(self) {
						    // スクロール
					        self.x -= 3;
						    // 端まで行ったら戻す
						    if (self.x <= -setting.gameWidth) {
						        self.x = setting.gameWidth -10; // 間が空くのでちょっと詰める
						    }
						},
						null
					),
					new SuperBackground(
						setting.gameWidth,
						setting.gameHeight,
						'background1.png',
						function(self) {
							// スクロール
							self.x -= 3;
							// 端まで行ったら戻す
							if (self.x <= -setting.gameWidth) {
								self.x = setting.gameWidth -10; // 間が空くのでちょっと詰める
							}
						},
						function(self) {
							self.x = setting.gameWidth;
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
						function(self) {
							// ゲームタイムを保存
							store.gameTime = ((game.frame / game.fps) - store.startTime).toFixed(2);
							self.text = 'Time: ' + store.gameTime + '秒,';
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
						function(self) {
							self.text = 'HP: ' + store.playerHitpoint + ',';
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
						function(self) {
							self.text = 'Speed: ' + store.playerAgility + ',';
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
					 	function(self) {
							self.text = 'Score: ' + store.gamePoint;
					 	}
					)
				],
				// フレーム処理
				function() {
					// 敵小用
					if (store.gameTime < 60) {
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
					if (store.gameTime > 10 && store.gameTime < 60) {
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
					if (store.gameTime >= 60 && store.gameTime < 120 && flag == 1) {
						// ボスの体
						new BossEnemyBody(
							550,
							300,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理
						// ボスの頭
						new BossEnemyHead(
							520,
							170,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理
						// ボスの頭のリボン
						new BossEnemyHeadRibon(
							535,
							130,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理
						// ボスの体のリボン
						new BossEnemyBodyRibon(
							560,
							300,
							game.frame+ Math.floor(Math.random()*(10000-0)+0),
							playGame
						).saveStore(enemyArr); // 敵の保存処理

						flag = 0;
					}

					// 時間アウト
					if (store.gameTime > 120) {
						// ゲームオーバーscenes
						console.log('ゲームオーバー');
						store.currentScene = 'gameover';
					}

					// ゲームオーバー処理
					if (store.currentScene == 'gameover') {
						// ゲームオーバーscene
						if (store.music) sound.stop();
						var gameOverSound = game.assets[files.gameOverSound].clone();
						if (store.music) gameOverSound.play();
						// ゲームオーバーscene
						var gameOver = new SuperScene(
							setting.gameWidth,
							setting.gameHeight,
							'black',
							[
								new SuperLabel(
								 	300,
								 	250,
								 	null,
								 	null,
								 	'white',
								 	'50px cursive',
								 	'GAME OVER',
								 	null
								),
								new SuperLabel(
								 	300,
								 	350,
								 	null,
								 	null,
								 	'white',
								 	'20px cursive',
								 	'※120秒過ぎると強制終了します',
								 	null
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