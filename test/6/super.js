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
		minPlayerHitpoint: 1, // プレイヤーの許容する最少HP
		playerAgility: 5, // プレイヤーの初期素早さ
		maxPlayerAgility: 20, // プレイヤーの移動速度の上限
		enemyBulletAgility: 10, // 敵の玉の速さ
		enemyAgility: 4, // 敵の速さ
		itemAgility:4, // アイテムの流れる速さ
		labelFontSize: '20px cursive, arial, sans-serif',
		gamePoint: 0, // ゲームのポイント
		playerWidth: 32, // プレイヤーの幅
		playerHeight: 32 // プレイヤーの高さ
	};

	// ゲームの画像用ストア
	var image = {
		background: 'background1.png',
		test: 'chara1.png',
		player: 'chara2.png',
		bullet: 'icon0.png',
		boss: 'bigmonster1.gif',
		title: 'logo.png',
		battle: 'battle.jpg',
		explosion: 'effect0.png',
		cure: 'heal_eff_thumb.png',
		shooter: 'shooter.png'
	};

	//　各種ポイントの保存庫
	var store = {
		playerHitpoint: '',
		playerAgility: '',
		bossHitpoint: '',
		gamePoint: ''
	}

	// ゲームの敵やアイテムのインスタンスの保存庫
	var playerArr = [],
		enemyArr = [],
		itemArr = [];

	// おまじない
	enchant();

	// デバッグの無効化
	if (setting.debug == true) {
		var noop = function(){};
		console.log = noop;
	}

	// DOM読み込み後
	window.onload = function(){

		// ################################
		//            ゲームの設定
		// ################################
		var game = new Core(setting.gameWidth, setting.gameHeight);
		game.fps = 30;
		game.keybind(32, 'space');

		// プリリロード
		with　(image) {
			game.preload(
				background,
				test,
				player,
				bullet,
				boss,
				title,
				explosion,
				cure,
				shooter
			);
		}

		// ゲーム読み込み時
		game.onload = function() {

			// ########################################################
			//            　　　　　　　　　クラス
			// ########################################################

			// #####################################
			//        　    ラベル
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
					if (self.x > setting.gameWidth ||
						self.x < 0) { // エンティティの位置がgameの幅を超えたら
						if (this._isArray(arr)) { // 配列の確認、プレイヤーは配列がないため
							self.removeInstance(self);
							console.log('自機か敵機かアイテムが画面外に出ました');
							console.log ( !!(　delete arr[self.uuid]) );
						} else {
							console.log('球が外に出ました');
							self.removeInstance(self);
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
					this.setImage('shooter.png');
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
								game.pushScene(gameOver);
							}
						}
					}
				},
				// 操作
				_controll: function() {
					// フレーム処理
					// 画像の切り替え			  	
				  	this.setFrame([0,1]);
				  	// キャラクターの操作処理
					if (game.input.left && this.x >0) {
						this.x -= setting.playerAgility;
					}
					if (game.input.right && this.x <setting.gameWidth - this.width) {
						this.x += setting.playerAgility;
					}
					if (game.input.up && this.y >0) {
						this.y -= setting.playerAgility;
						this.frame = 2;		
					}
					if (game.input.down && this.y <setting.gameHeight - this.height) {
						this.y += setting.playerAgility;
						this.frame = 3;
					}
					if (game.input.up == false && game.input.down == false)  {
						this.setFrame(
							(this.frame == 1) ? 0 : 1
						);
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
					return this;
				}
			});

			// ###########################
			//    雑魚的クラス
			// ###########################
			var ZakoEnemy = Class.create(Enemy, {
				initialize: function(x, y, uuid) {
					Enemy.call(this, x, y, uuid);
					this.setFrame([4,5]);
					this.setImage('shooter.png');
					this.addInstance(this);
					// 敵の玉の発射処理
					var self = this;
					// イベント処理
					this.addEventListener('enterframe', function(e){
						// 敵の動きの処理
						this.move();
						// 敵の玉の発射処理
						if (game.frame  % 50 == 0) {
							console.log('雑魚敵の玉の発射');
							new EnemyBullet(this.x - this.width, this.y);
						}
						// 敵の排出処理
						self.getOut(self, enemyArr);
					});
				},
				// 敵の動きを再現する
				move: function() {
					// 敵の玉の発射処理
					this.x -= setting.enemyAgility;
 					this.y = Math.cos ( this.x * Math.PI / 180 ) * 220 + 300;
				}
			});

			// ###########################
			//    雑魚的クラス
			// ###########################
			var ZakoEnemy2 = Class.create(Enemy, {
				initialize: function(x, y, uuid) {
					Enemy.call(this, x, y, uuid);
					this.setFrame([6,7]);
					this.setImage('shooter.png');
					this.addInstance(this);
					// 敵の玉の発射処理
					var self = this;
					// イベント処理
					this.addEventListener('enterframe', function(e){
						// 敵の動きの処理
						this.move();
						// 敵の玉の発射処理
						if (game.frame  % 50 == 0) {
							console.log('雑魚敵2の玉の発射');
							new EnemyBullet(this.x - this.width, this.y);
						}
						// 敵の排出処理
						self.getOut(self, enemyArr);
					});
				},
				// 敵の動きを再現する
				move: function() {
					// 敵の玉の発射処理
					this.x -= setting.enemyAgility;
 					this.y = Math.sin ( this.x * Math.PI / 180 ) * 220 + 300;
				}
			});


			// ###########################
			//    BOSS敵のクラス
			// ###########################
			var BossEnemy = Class.create(Enemy, {
				initialize: function(x, y, uuid) {
					Enemy.call(this, x, y, uuid);
					this.setFram([1]);
					this.setImage('chara1.png');
					this.addInstance(this);
					this.addEventListener('enterframe', function(e) {
						this.move();
						if (game.frame % 30 == 0) {
							console.log('ボス敵の発射処理');
							//new BossEnemyBullet();
						}
					});
				},
				// ボス敵の動きを再現する
				move: function(){
					
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
				// アイテムやバレット（自機、敵機）が敵機や自機に衝突した時の処理	
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
				}				
			});

			// ###########################
			//    実機玉子クラス
			// ###########################
			var PlayerBullet = Class.create(Bullet, {
				initialize: function(x, y) {
					Bullet.call(this, 16, 16);
					this.setPosition(setting.playerWidth + x, setting.playerHeight/4 + y);
					this.setImage('icon0.png');
					this.setFrame([50]);
					this.addInstance(this);
					var self = this; // コンテキストの避難
					this.addEventListener('enterframe', function(){
						// 球の速度
						this.x += setting.playerBulletAgility;
						// ヒット処理
						this.hitEntity(self, enemyArr, function(arr, i){
							console.log('ポイントのアップ処理');
							new Explosion(
								self.x,
								self.y
							);
							// 速度オプションの変更(上限を超えない範囲で)
							setting.gamePoint += 3;
							// 敵の画像を削除する
							playGame.removeChild(arr[i]);
							// 敵の配列を削除する
							console.log( !!(delete arr[i]) );
						});
						// 画面外に出る処理
						this.getOut(self, null);
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
					this.setPosition(setting.playerWidth + x, setting.playerHeight/2 + y);
					this.setImage('icon0.png');
					this.setFrame([62]);
					this.addInstance(this);
					var self = this;
					this.addEventListener('enterframe', function(){
						// 球の発射速度
						self.x -= setting.playerBulletAgility;
						// 自機とのヒット処理
						self.hitEntity(self, playerArr, function(arr, i){
							// Note: 自機の画像も自機の配列の要素も削除しない
							// 回復オプションの変更(上限を超えない範囲で)
							if (setting.playerHitpoint != setting.minPlayerHitpoint) {
								// 爆発処理(敵に当たった時なのでselfを使用する)
								new Explosion(
									self.x,
									self.y
								);
								setting.playerHitpoint--;
							} else {
								// ゲームオーバー処理
								console.log('GAME OVER');
								// ゲームオーバー
								game.pushScene(gameOver);
							}
						});
						// 画面外に出る処理
						self.getOut(self, null);
					});
					return this;
				}
			});

			// ###########################
			//    敵機玉子クラス
			// ###########################
			var EnemyBullet2 = Class.create(Bullet, {
				initialize: function(x, y) {
					Bullet.call(this, 16, 16);
					this.setPosition(setting.playerWidth + x, setting.playerHeight/2 + y);
					this.setImage('icon0.png');
					this.setFrame([62]);
					this.addInstance(this);
					var self = this;
					this.addEventListener('enterframe', function(){
						// 球の発射速度
						self.x -= setting.playerBulletAgility;
						// 自機とのヒット処理
						self.hitEntity(self, playerArr, function(arr, i){
							// Note: 自機の画像も自機の配列の要素も削除しない
							// 回復オプションの変更(上限を超えない範囲で)
							if (setting.playerHitpoint != setting.minPlayerHitpoint) {
								// 爆発処理(敵に当たった時なのでselfを使用する)
								new Explosion(
									self.x,
									self.y
								);
								setting.playerHitpoint -= 2;
							} else {
								// ゲームオーバー処理
								console.log('GAME OVER');
								// ゲーム中断
								game.stop();
								// ゲームオーバー
								game.pushScene(gameOver);
							}
						});
						// 画面外に出る処理
						self.getOut(self, null);
					});
					return this;
				}
			});

			// ###########################
			//   　　アイテムクラス
			// ###########################
			var Item = Class.create(Things, {
				// コンストラクタ
				initialize: function(x, y) {
					Things.call(this, x, y); // 最初の位置
					this.setImage('icon0.png');
					var self = this;
					this.addEventListener('enterframe', function(){
						// アイテムの速度
						self.x -= setting.itemAgility;
						// 画面外に出る処理
						self.getOut(self, null);
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
						self.hitEntity(self, playerArr, function(arr, i){
							// Note: ここでは自機の画像削除も配列の要素の削除も行わない
							// 回復演出
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
			//   速度アイテム
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
						// Note: ここでは自機の画像削除も配列の要素の削除も行わない
						// ヒット処理
						self.hitEntity(self, playerArr, function(){
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
			//   　　演出クラス(最初と終わりなど)
			// ###########################
			var Expression = Class.create(SuperSprite, {
				initialize: function(x, y) {
				}
			});

			// ###########################
			//    爆発演出クラス
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
							self.removeInstance(self);
						}
					});
					return this;
				}
			});

			// ###########################
			//    回復演出クラス
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
							self.removeInstance(self);
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
			bg1.addEventListener('enterframe', function() {
				// 背景を動かす
				//this.x -= setting.playerAgility;
			});

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
					game.frame
				);
				player.saveStore(playerArr); // 出現データの保存
				flag = 2;

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
								game.frame //UUID
							).saveStore(enemyArr); // 敵の保存処理
						}
						// 敵を出現させる(zako敵)
						if (game.frame % 70 == 0) {
							new ZakoEnemy2(
								setting.gameWidth - Math.floor(Math.random() * (30-20) + 20),
								Math.floor(Math.random()*(setting.gameHeight-0)+0),
								game.frame //UUID
							).saveStore(enemyArr); // 敵の保存処理
						}
						// 回復アイテムを出現
						if (game.frame % 100 == 0) {
							// 回復アイテムの出現
							new RecoveryItem(
								setting.gameWidth-30,
								Math.floor(Math.random()*(setting.gameHeight-0)+0)
							);
						}
						// 速度アップアイテムを出現させる
						if (game.frame % 120 == 0) {
							// 速度アップアイテム
							new SpeedItem(
								setting.gameWidth-30,
								Math.floor(Math.random()*(setting.gameHeight-0)+0)
							);
						}

					} else if (currentTime >= 60 && currentTime <= 120) {
						// 第二フェーズ
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
			var gameOver = new Scene();
			gameOver.backgroundColor = 'black';
			gameOver.addChild(gameOverMessage);
			gameOver.addEventListener('touchstart', function() {
				game.popScene(playGame);
				game.popScene(gameOver);
				console.log('タッチしました2');
			});

			// ###########################
			//    playgame処理
			// ###########################
			/*
			var player = new Player(
				0,
				setting.gameHeight/2,
				game.frame
			);
			player.saveStore(playerArr); // 出現データの保存
			*/
		};
		game.start();
	};

	/*
		参考文献
		http://www.slideshare.net/sidestepism/5-tlenchantjs
	*/

}());