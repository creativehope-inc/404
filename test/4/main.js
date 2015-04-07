(function() {

	// 選択肢
	var options;

	// ゲーム設定用のオブジェクト
	var setting = {
		debug: true,
		gameWidth: 960,
		gameHeight: 540,
		bulletWidht: 16,
		bulletHieht: 16,
		playerBulletAgility: 10, // プレイヤーの玉の速さ
		playerAgility: 4,
		labelFontSize: '40px arial, sans-serif'
	};

	// ゲームの画像用ストア
	var store = {
		test: 'chara1.png',
		player: 'chara2.png',
		bullet: 'icon0.png',
		boss: 'bigmonster1.gif',
		title: 'title.jpg',
		battle: 'battle.jpg'
	};

	// ゲームの保存庫
	var enemyArr = [],
		playerBulletArr = [],
		playerArr = [],
		enemyBulletArr = [];

	// おまじない
	enchant();

	// デバッグの上書き

	// DOM読み込み後
	window.onload = function(){

		// ################################
		//            ゲームの設定
		// ################################
		var game = new Core(setting.gameWidth, setting.gameHeight);
		game.fps = 30;
		game.keybind(32, 'space');

		// プリリロード
		with　(store) {
			game.preload(test, player, bullet, boss, title);
		}

		// ゲーム読み込み時
		game.onload = function() {

			// ########################################################
			//            背景用スプライト
			// ########################################################

			// トップ用のスプライト
			var titleBackground = new Sprite(setting.gameWidth, setting.gameHeight);
			titleBackground.image  = game.assets["title.jpg"];

			// 対戦用のスプライト
			var battleBackground = new Sprite(setting.gameWdith, setting.gameHeight);
			//battleBackground.image = game.assets['battle.jpg'];

			// ########################################################
			//            ラベル
			// ########################################################

			// ハローメッセージ
			var welcomeMessage = new Label('ゲームを開始するには、画面をクリックしてください');
			welcomeMessage.x = 50;
			welcomeMessage.y = setting.gameHeight / 1.2;
			welcomeMessage.width = setting.gameWidth;
			welcomeMessage.color = 'black';
			welcomeMessage.font = setting.labelFontSize;

			// 時間のラベル
			var timeCounter = new Label('');
			timeCounter.x = timeCounter.y = 10;
			timeCounter.width = '300px';
			timeCounter.color ='red';
			timeCounter.font = setting.labelFontSize;
			timeCounter.addEventListener('enterframe', function(){ // 時間のカウント
				timeCounter.text = 'Time: ' + (game.frame / game.fps).toFixed(2) + '秒';
			});

			// ポイントのラベル(得点)
			var pointCounter = new Label('0 point');
			pointCounter.x = 100;
			pointCounter.y = 100;
			pointCounter.height = '300px';
			pointCounter.width = '300px';
			pointCounter.color = 'red';
			pointCounter.font = setting.labelFontSize;
			pointCounter.text = '0 points';

			// ゲームオーバーのメッセージ
			var gameOverMessage = new Label('ゲームオーバー');
			gameOverMessage.x = gameOverMessage.y = 50;
			gameOverMessage.font = '40px';
			gameOverMessage.color = "white";

			// ########################################################
			//            　　　　シーンの設定
			// ########################################################

			// #####################
			//    ルートシーン
			// #####################
			game.rootScene.background = game.assets['background.png'];
			game.rootScene.addEventListener('touchstart', function() {
				game.pushScene(playGame);
			});
			game.rootScene.addChild(titleBackground);
			game.rootScene.addChild(welcomeMessage); // 最初の文字列をつかする

			// ###################
			//   セカンドシーン
			// ###################
			var playGame = new Scene();
			playGame.backgroundColor = 'pink';
			playGame.addChild(timeCounter); // 時間の表示
			playGame.addChild(pointCounter); // ポイントの表示
			// ゲームオーバー画面へ
			playGame.addEventListener('touchstart', function() {
				game.pushScene(gameOverScene);
			});

			// ###################
			//   ゲームオーバーシーン
			// ###################
			var gameOverScene = new Scene();
			gameOverScene.backgroundColor = 'black';	
			gameOverScene.addChild(gameOverMessage);
			gameOverScene.addEventListener('touchstart', function() {
				game.pushScene(game.rootScene);
			});

			// ########################################################
			//            　　　　     クラス
			// ########################################################


			// ###########################
			//    スーパースプライトクラス
			// ###########################
			var SuperSprite = Class.create(Sprite, {
				// コンストラクタ
				initialize: function(x, y){
					//console.log('スーパークラスの継承');
					Sprite.call(this, x, y);
					return this;  
				},
				// 機体の追加処理
				addInstance: function(self) {
					//console.log('インスタンスの追加');
					playGame.addChild(self);
					return this;
				},			
				// 機体の削除処理
				removeInstance: function(self) {
					//console.log('インスタンスの削除')
					playGame.removeChild(self);
					// 配列のdelete処理
					return this;
				},
				// バリデーション
				validation: function() {
					return this;
				},
				// ###############
				//   ラッパーメソッド
				// ###############

				// キャラクターポジション
				setPosition: function(x, y) {
					//console.log('キャラクターの位置替え');
					this.x = x;
					this.y = y;
					return this;
				},
				// フレーム(アニメ)のセット
				setFrame: function(arr) {
					//console.log('フレームのセット');
					this.frame = arr;
					return this;
				},
				// 画像のセット
				setImage: function(imgSrc) {
					//console.log('画像切り替え');
					this.image = game.assets[imgSrc];
					return this;
				},
				// 画面外に出たら削除するメソッド(ストアの配列とインスタンスの削除)
				getOut: function(self, arr) {
					if (self.x < setting.gameWidth) { // エンティティの位置がgameの幅を超えたら
						console.log ( !!(arr[self.uuid]) );
						self.removeInstance(self);
					}
				},
				// ストアでオブジェクトを破壊するためにUUIDを保存しておく
				setUUID: function(uuid) {
					console.log(uuid);
					this.uuid = uuid;
					return this;
				},
				// 配列に保存する用のメソッド
				saveStore: function(arr) {
					arr[this.uuid] = this;
					console.log(arr);
				}
			});


			// ###########################
			//    機体クラス
			// ###########################
			var Aircraft = Class.create(SuperSprite, {
				// コンストラクタ
				initialize: function(x, y){
					SuperSprite.call(this, x, y);
					return this;
				},
			});

			// ###########################
			//    球クラス(球の衝突や)
			// ###########################
			var Bullet = Class.create(SuperSprite, {
				initialize: function(x, y) {
					SuperSprite.call(this, x, y);
					return this;				
				},
				// 銃による機体との衝突パターン
				bulletAttack: function() {

				}
			});

			// ###########################
			//    敵機クラス
			// ###########################
			var Enemy = Class.create(Aircraft, {
				initialize: function(x, y, uuid) {
					Aircraft.call(this, 32, 32);
					// ポジションと画像とフレームの切り替え
					this.setPosition(x, y);
					this.setImage('chara1.png');
					this.setFrame([1]);
					// UUIDの保存
					this.setUUID(uuid);
					// 出現処理
					this.addInstance(this);
					this.addEventListener('enterframe', function(e){
						// プレイヤーと衝突しました
						if (this.within(player, player.width/2)) {
							console.log('衝突しました');
							// ゲーム中断
							game.stop();
							// ゲームオーバー
							game.pushScene(gameOverScene);
						}
					});
					return this;
				},
				// 機体の直接衝突パターン
				directAttack: function() {

					return this;
				}
			});

			// ###########################
			//    プレイヤー クラス
			// ###########################
			var Player = Class.create(Aircraft, {
				initialize: function(x, y) {
					// キャラクター
					Aircraft.call(this, 32, 32);
					this.setPosition(x, y);
					this.setImage('chara2.png');
					// フレーム処理
					this.addEventListener('enterframe', function() {

						// 画像の切り替え
					  	this.setFrame([1,2,3]);
					  	// キャラクターの操作
						if (game.input.left && this.x >0) {
							this.x -= setting.playerAgility;
							this.frame = 2;
						}
						if (game.input.right && this.x <setting.gameWidth - this.width) {
							this.x += setting.playerAgility;
							this.frame = 1;
						}
						if (game.input.up && this.y >0) {
							this.y -= setting.playerAgility;
						}
						if (game.input.down && this.y <setting.gameHeight - this.height) {
							this.y += setting.playerAgility;
						}
						if (game.input.up == false && game.input.down == false)  {
							this.setFrame(this.frame + 1);
						}

						// 発射処理
						if (game.input.space && game.frame % 3 == 0) {
							// ミサイル
							new PlayerBullet(this.x, this.y);
						}
					});

					// 最後に機体の追加
					this.addInstance(this);

					// メソッドチェーン
					return this;
				},
				circle: function() {
					// プレイヤーの初期移動処理
					this.tl.moveBy(setting.gameWidth/2, 1, 30, enchant.Easing.QUAD_EASEINOUT) // (200,0 )に90フレーデ絶対位置でイージングで移動
							.and()
							.rotateTo(360 * 10, 30, enchant.Easing.LINEAR)
							.and()
							.scaleTo(3, 3, 30) //
							.and() 
							.rotateTo(360 * 10, 30, enchant.Easing.LINEAR)
							.moveTo(0, setting.gameHeight/2, 30)
							.and()
							.scaleTo(1, 1, 30); // 絶対位置に移動
					// メソッドチェーン
					return this;
				}
			});

			// ###########################
			//    実機玉子クラス
			// ###########################
			var PlayerBullet = Class.create(Bullet, {
				initialize: function(x, y) {
					Bullet.call(this, 16, 16);
					this.setPosition(player.width + x, player.height/2 + y);
					this.setImage('icon0.png');
					this.setFrame(54, 62);
					this.addInstance(this);
					this.addEventListener('enterframe', function(){
						// 球の速度
						this.x += setting.playerBulletAgility;
						// 衝突判定
						for (var i in enemyArr) {
							if (enemyArr[i].intersect(this)) {
								console.log('当たりました');
								playGame.removeChild(this);
								playGame.removeChild(enemyArr[i]);
								enemyArr[i].frame = [7];
								console.log( !!(delete enemyArr[i]) );
							} else {
								enemyArr[i].frame= [6];
							}
						}

						//this.getOut(this, enemyArr);
						//console.log(this.uuid);
						// 画面外解放(x軸のみ)
						
						if (this.x > setting.gameWidth) {
							// UUIDの値を削除する
							console.log('外に出ました');
							console.log( !!(delete enemyArr[this.uuid]) );
							this.removeInstance(this);
						}
					});
					return this;
				}
			});

			// ###########################
			//    爆発クラス
			// ###########################
			var Explosion = Class.create(SuperSprite, {
				// コンストラクタ
				initialize: function(x, y){
					SuperSprite.call(this, x, y);
					return this;
				},
			});

			// ###########################
			//   アイテムクラス
			// ###########################
			var Item = Class.create(SuperSprite, {
				// コンストラクタ
				initialize: function(x, y){
					SuperSprite.call(this, x, y);
					return this;
				},
			});

			// ###########################
			//    メイン
			// ###########################
			/// 味方の出現
			var player = new Player(0, setting.gameHeight/2);
			player.circle();
 
			playGame.addEventListener('enterframe', function() {

				// 適当なタイミングでキャラクターの挿入
				if (game.frame % 100 == 0) {
					//　敵の出現処理
					var enemy = new Enemy(
						Math.floor(Math.random()*(setting.gameWidth-0)+0),
						Math.floor(Math.random()*(setting.gameHeight-0)+0),
						game.frame // UUID
					);
					// 敵を配列に保存
					enemy.saveStore(enemyArr);
				}

				// 最初に敵をたくさん出現させる(1/100)
				if (game.frame % 100 == 0) {
					console.log('敵出現アクション入れ込みタイミング');
				}
			});
		};
		game.start();
	};

	// 判定用の処理まとめ
	/*
	function hantei(arr, ) {

	}
	*/


	/*

		参考文献
		http://www.slideshare.net/sidestepism/5-tlenchantjs

	*/
}());