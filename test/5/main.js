(function() {

	// 選択肢
	var options;

	// ゲーム設定用のオブジェクト
	var setting = {
		debug: true,
		gameWidth: 960, // ゲームの幅
		gameHeight: 540, // ゲームの高さ
		bulletWidht: 16, // 球の幅
		bulletHieht: 16, // 球の高さ
		playerBulletAgility: 10, // プレイヤーの玉の速さ
		playerHitpoint: 3, // プレイヤーの初期体力
		maxPlayerHitpoint: 10, // プレイヤーのMAX体力
		playerAgility: 5, // プレイヤーの初期素早さ
		maxPlayerAgility: 30, // プレイヤーの移動速度の上限
		enemyBulletAgility: 10, // 敵の玉の速さ
		enemyAgility: 4, // 敵の速さ
		itemAgility:4, // アイテムの流れる速さ
		labelFontSize: '20px arial, sans-serif',
		gamePoint: 0 // ゲームのポイント
	};

	// ゲームの画像用ストア
	var store = {
		test: 'chara1.png',
		player: 'chara2.png',
		bullet: 'icon0.png',
		boss: 'bigmonster1.gif',
		title: 'title.jpg',
		battle: 'battle.jpg',
		explosion: 'effect0.png',
		cure: 'heal_eff_thumb.png'
	};

	// ゲームの保存庫
	var playerArr = [],
		enemyArr = [],
		itemArr = [];

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
			game.preload(test, player, bullet, boss, title, explosion, cure);
		}

		// ゲーム読み込み時
		game.onload = function() {


			// ########################################################
			//            　　　　　　　　　クラス
			// ########################################################

			// #####################################
			//        　    ラベル
			// #####################################

			var WrapperLabel = Class.create(Label, {
				// コンストラクタ
				initialize: function(x, y, width, height, color, font, text, callback) {
					Label.call(this, text); // 最初の位置
					// 一気にインスタンスプロパティのセット
					this.x = x;
					this.y = y;
					//this.width = width || 'auto';
					//this.height = height || 'auto';
					this.color = color;
					this.font = font;
					this.text = text || '';
					this.addEventListener('enterframe', function() {
						if (callback) callback();
					});
				}
			});

			// #####################################
			//        　     スプライト
			// #####################################

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
				// プレイヤーバレットの時は、arrなし
				getOut: function(self, arr) {
					if (self.x > setting.gameWidth) { // エンティティの位置がgameの幅を超えたら
						if (this._isArray(arr)) { // 配列の確認、プレイヤーは配列がないため
							console.log ( !!(arr[self.uuid]) );
							self.removeInstance(self);
							console.log('外に出ました');
						} else {
							self.removeInstance(self);
							console.log('外に出ました');
						}
					}
				},
				// 配列か確認プライベートメソッド
				_isArray: function(value) {
					return value &&                             
						typeof value === 'object' &&
						typeof value.length === 'number' &&
						typeof value.splice === 'function' &&
						!(value.propertyIsEnumerable('length'));
				}
			});


			// ###########################
			//    機体クラス(全てのエンティティを保存する)
			// ###########################
			var Aircraft = Class.create(SuperSprite, {
				// コンストラクタ
				initialize: function(x, y, uuid){
					SuperSprite.call(this, x, y);
					// UUIDの保存
					this.setUUID(uuid);
					return this;
				},
				// ストアでオブジェクトを破壊するためにUUIDを保存しておく
				setUUID: function(uuid) {
					this.uuid = uuid;
					console.log(uuid);
					return this;
				},
				// 配列に保存する用のメソッド
				saveStore: function(arr) {
					arr[this.uuid] = this;
					console.log(arr);
				}
			});

			// ###########################
			//    プレイヤー クラス　
			// ###########################
			var Player = Class.create(Aircraft, {
				initialize: function(x, y, uuid) {
					// キャラクター
					Aircraft.call(this, 32, 32, uuid);
					this.setPosition(x, y);
					this.setImage('chara2.png');
					// フレーム処理
					this.addEventListener('enterframe', function(){
						// 敵に衝突したときの処理
						this._hitEnemy(this, enemyArr);
						// コントロール
						this._controll();
					});
					// 最後に機体の追加
					this.addInstance(this);
					// 最初の演出
					this._came();
					// メソッドチェーン
					return this;
				},
				// 来たときの処理
				_came: function() {
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
				},
				// 敵機との直接衝突処理
				_hitEnemy: function(self, arr){
					for (var i in arr) {
						if (arr[i].intersect(self)) {
							// 爆発処理
							new Explosion(
								this.x,
								this.y
							)
							// 敵機インスタンスの削除
							playGame.removeChild(arr[i]);
							console.log( !!(delete arr[i]) );
							// 敵機の体力の減算
							setting.playerHitpoint--;
							// 完全にHPが0の時の処理
							if (setting.playerHitpoint <= 0) {
								console.log('衝突しました');
								playGame.removeChild(self);
								// ゲーム中断
								game.stop();
								// ゲームオーバー
								game.pushScene(gameOverScene);
							}
						}
					}
				},
				// 操作
				_controll: function() {
					// フレーム処理
					// 画像の切り替え
				  	this.setFrame([1,2,3]);
				  	// キャラクターの操作処理
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
					if (game.input.space && game.frame % 5 == 0) {
						// ミサイル
						new PlayerBullet(this.x, this.y);
					}
				}
			});

			// ###########################
			//    敵機クラス
			// ###########################
			var Enemy = Class.create(Aircraft, {
				initialize: function(x, y, uuid) {
					Aircraft.call(this, 32, 32, uuid);
					// ポジションと画像とフレームの切り替え
					this.setPosition(x, y);
					this.setImage('chara1.png');
					this.setFrame([1]);
					// 出現処理
					this.addInstance(this);
					this.addEventListener('enterframe', function(e){
						// 敵の動きの処理
						this.move();
						// 敵の玉の発射処理
						if (game.frame  % 50 == 0) {
							console.log('敵の玉の発射');
							new EnemyBullet(this.x - this.width, this.y);
						}
					});
					return this;
				},
				move: function() {
					// 敵の玉の発射処理
					this.x -= setting.enemyAgility;
 					this.y = Math.cos ( this.x * 2 * Math.PI / 180 ) * 220 + 300;
				}
			});

			// ###########################
			//    モノのクラス(item, bulletが継承する)
			// ###########################
			var Things = Class.create(SuperSprite, {
				initialize: function(x, y) {
					SuperSprite.call(this, x, y);
					return this;				
				},				
				hitEntity: function(self, arr, callback) {
					// 衝突判定
					for (var i in arr) {
						if (arr[i].intersect(self)) {
							// モノは確実に削除する
							playGame.removeChild(self);
							// コールバック
							if (callback) callback(arr, i);
						}
					}
				}
			});

			// ###########################
			//    球クラス(球の衝突や)
			// ###########################
			var Bullet = Class.create(Things, {
				initialize: function(x, y) {
					Things.call(this, x, y);
					return this;
				},
				// **************オーバーライド***************
				// 銃による機体との衝突パターン
				hitEntity: function(self, arr, callback) {
					// 衝突判定
					for (var i in arr) {
						if (arr[i].intersect(self)) {
							// モノは確実に削除する
							playGame.removeChild(self);
							// 以下の2行が特別処理
							playGame.removeChild(arr[i]);
							console.log( !!(delete arr[i]) );
							// コールバック
							if (callback) callback();
						}
					}
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
					this.setFrame([54, 62]);
					this.addInstance(this);
					var self = this; // コンテキストの避難
					this.addEventListener('enterframe', function(){
						// 球の速度
						this.x += setting.playerBulletAgility;
						// ヒット処理
						this.hitEntity(this, enemyArr, function(){
							console.log('ポイントのアップ処理');
							new Explosion(
								self.x,
								self.y
							);
							// 速度オプションの変更(上限を超えない範囲で)
							setting.gamePoint += 3;
						});
						// 画面外に出る処理
						this.getOut(this, null);
					});
					return this;
				}
			});

			// ###########################
			//    敵機玉子クラス
			// ###########################
			var EnemyBullet = Class.create(Bullet, {
				initialize: function(x, y) {
					Bullet.call(this, 16, 16);
					this.setPosition(player.width + x, player.height/2 + y);
					this.setImage('icon0.png');
					this.setFrame(54, 62);
					this.addInstance(this);
					this.addEventListener('enterframe', function(){
						// 球の発射速度
						this.x -= setting.playerBulletAgility;
						// 自機とのヒット処理
						this.hitEntity(this, playerArr, function(){
							console.log('ポイントダウン処理');
							// ゲーム中断
							game.stop();
							// ゲームオーバー
							game.pushScene(gameOverScene);
						});
						// 画面外に出る処理
						this.getOut(this, null);
					});
					return this;
				}
			});

			// ###########################
			//   アイテムクラス
			// ###########################
			var Item = Class.create(Things, {
				// コンストラクタ
				initialize: function(x, y) {
					Things.call(this, x, y); // 最初の位置
					this.setImage('icon0.png');
					this.addEventListener('enterframe', function(){
						// アイテムの速度
						this.x -= setting.itemAgility;
						// 画面外に出る処理
						this.getOut(this, null);
					});
					return this;
				}
			});

			// ###########################
			//   回復アイテム
			// ###########################
			var RecoveryItem = Class.create(Item, {
				// コンストラクタ
				initialize: function(x, y) {
					Item.call(this, 16, 16); // 最初の位置
					this.setPosition(x, y); // ポジションを変える
					this.setImage('icon0.png');
					this.setFrame([10]); // 回復アイテム
					this.addInstance(this);
					var self = this; // コンテキストの避難
					this.addEventListener('enterframe', function(){
						// ヒット処理
						this.hitEntity(this, playerArr, function(){
							// 回復処理
							new Cure(
								self.x,
								self.y
							);
							console.log('アイテムが当たったので、回復します');
							// 回復オプションの変更(上限を超えない範囲で)
							if (setting.playerHitpoint < setting.maxPlayerHitpoint) {
								setting.playerHitpoint++;
							}
						});
					});
					return this;
				}
			});

			// ###########################
			//   回復アイテム
			// ###########################
			var SpeedItem = Class.create(Item, {
				// コンストラクタ
				initialize: function(x, y) {
					Item.call(this, 16, 16); // 最初の位置
					this.setPosition(x, y); // ポジションを変える
					this.setImage('icon0.png');
					this.setFrame([13]); // 回復アイテム
					this.addInstance(this);
					var self = this;
					this.addEventListener('enterframe', function(){
						// ヒット処理
						this.hitEntity(this, playerArr, function(){
							// 回復処理
							new Cure(
								self.x,
								self.y
							);
							console.log('アイテムが当たったので、速度アップします');
							// 速度オプションの変更(上限を超えない範囲で)
							if (setting.playerAgility < setting.maxPlayerAgility ) {
								setting.playerAgility += 5;
							}
						});
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
					SuperSprite.call(this, 16, 16);
					this.setPosition(x, y); // ポジションを変える
					this.setImage('effect0.png');
					this.setFrame([1,2,3,4,5]);
					this.addInstance(this);
					var self = this;
					this.addEventListener('enterframe', function() {
						// 爆発フレームが5になったら爆発フレームの削除をする
						if (self.frame == 5) {
							this.removeInstance(this);
						}
					});
					return this;
				}
			});


			// ###########################
			//    回復クラス
			// ###########################
			var Cure = Class.create(SuperSprite, {
				// コンストラクタ
				initialize: function(x, y){
					SuperSprite.call(this, 16, 16);
					this.setPosition(x, y); // ポジションを変える
					this.setImage('heal_eff_thumb.png');
					this.setFrame([1,2,3,4]);
					this.addInstance(this);
					var self = this;
					this.addEventListener('enterframe', function() {
						// 爆発フレームが5になったら爆発フレームの削除をする
						if (self.frame == 4) {
							this.removeInstance(this);
						}
					});
					return this;
				}
			});


			// ########################################################
			//                        メイン処理
			// ########################################################

			// #####################
			//      ラベル(文字)のインスタンス
			// ####################

			var welcomeMessage = new WrapperLabel (
				250,
				setting.gameHeight /1.2,
				setting.gameWidth + 'px',
				'200px',
				'black',
				setting.labelFontSize,
				'ゲームを開始するいには画面をクリックしてください',
				null
			);

			var timeCounter = new WrapperLabel(
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

			var hitpointCounter = new WrapperLabel(
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

			var speedCounter = new WrapperLabel(
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

			 var pointCounter = new WrapperLabel(
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

			 var gameOverMessage = new WrapperLabel(
			 	50,
			 	50,
			 	null,
			 	null,
			 	'white',
			 	setting.labelFontSize,
			 	'GAME OVER',
			 	null
			 );

			// #####################
			//     スプライト（背景）のインスタンス化
			// #####################

			// トップ用のスプライト
			var titleBackground = new Sprite(setting.gameWidth, setting.gameHeight);
			titleBackground.image  = game.assets["title.jpg"];

			// 対戦用のスプライト
			var battleBackground = new Sprite(setting.gameWdith, setting.gameHeight);
			//battleBackground.image = game.assets['battle.jpg'];

			// ########################################################
			//            　　　　シーンの設定
			// ########################################################

			// #####################
			//    rootシーン
			// #####################
			game.rootScene.background = game.assets['background.png'];
			game.rootScene.addEventListener('touchstart', function() {
				game.pushScene(playGame);
			});
			game.rootScene.addChild(titleBackground);
			game.rootScene.addChild(welcomeMessage); // 最初の文字列をつかする

			// ###################
			//   playGameシーン
			// ###################
			var playGame = new Scene();
			playGame.width = setting.gameWidth;
			playGame.height = setting.gameHeight;
			playGame.backgroundColor = 'pink';
			playGame.addChild(timeCounter); // 時間の表示
			playGame.addChild(hitpointCounter); // ポイントの表示
			playGame.addChild(speedCounter); // HPを表示
			playGame.addChild(pointCounter); // ポイントの表示

			// ゲームオーバー画面へ
			playGame.addEventListener('touchstart', function() {
				game.pushScene(gameOverScene);
			});

			// ###################
			//   game overシーン
			// ###################
			var gameOverScene = new Scene();
			gameOverScene.backgroundColor = 'black';	
			gameOverScene.addChild(gameOverMessage);
			gameOverScene.addEventListener('touchstart', function() {
				game.pushScene(game.rootScene);
			});

			// ###########################
			//    playgame処理
			// ###########################
			var player = new Player(
				0,
				setting.gameHeight/2,
				game.frame
			);
			player.saveStore(playerArr); // 出現データの保存

 			// ゲームが始まったら始めるタイマー処理
			playGame.addEventListener('enterframe', function() {

				// ifぶんでタイマー処理（フェーズわけ）
				if (game.frame % 50 == 0) {
					//　敵の出現処理
					new Enemy(
						setting.gameWidth-30,
						Math.floor(Math.random()*(setting.gameHeight-0)+0),
						game.frame // UUID
					).saveStore(enemyArr); // 敵の保存処理

				}
				if (game.frame % 100 == 0) {
					// 回復アイテムの出現
					new RecoveryItem(
						setting.gameWidth-30,
						Math.floor(Math.random()*(setting.gameHeight-0)+0)
					);
				}

				if (game.frame % 120 == 0) {
					// 速度アップアイテム
					new SpeedItem(
						setting.gameWidth-30,
						Math.floor(Math.random()*(setting.gameHeight-0)+0)
					);
				}

			});
		};
		game.start();
	};

	/*

		参考文献
		http://www.slideshare.net/sidestepism/5-tlenchantjs

	*/

}());