 $(document).ready(function(){

	// #####################################
	//        　    インポート
	// #####################################
	var game = window.game.game,
		setting = window.game.setting,
		image = window.game.image,
		store = window.game.store,
		playerArr = window.game.playerArr,
		enemyArr = window.game.enemyArr,
		itemArr = window.game.itemArr;

	// スーパーの設定
	var SuperLabel = window.super.SuperLabel,
		SuperSprite = window.super.SuperSprite;


	// ###########################
	//    機体クラス(全てのエンティティを保存する)
	// ###########################
	var Aircraft = Class.create(SuperSprite, {
		// コンストラクタ
		initialize: function(x, y, uuid, me, go){ // meはplayGameインスタンス、goはGameOverインスタンス
			SuperSprite.call(this, x, y, me);
			// UUIDの保存
			this._setUUID(uuid);
			// gameOverインスタンスの保存
			this._setGOInstance(go);
			// チェーン用
			return this;
		},
		// ストアでオブジェクトを破壊するためにUUIDを保存しておく
		_setUUID: function(uuid) {
			this.uuid = uuid;
			console.log(uuid);
			return this;
		},
		// 配列に保存する用のメソッド
		saveStore: function(arr) {
			arr[this.uuid] = this;
			console.log(arr);
			return this;
		},
		// gameOverインスタンスを保存するアクセサ
		_setGOInstance: function(go) {
			this.go = go;
			console.log('GameOverインスタンスの保存');
			return this;
		},
		// ゲームオーバー処理
		/*
		gameOver: function() {
			console.log('ゲームオーバー');
			game.pushScene(this.go);
			return this;
		}
		*/
	});

	// ###########################
	//    プレイヤー クラス　
	// ###########################
	var Player = Class.create(Aircraft, {
		initialize: function(x, y, uuid, me, go) {
			// キャラクター
			Aircraft.call(this, 32, 32, uuid, me);
			this.setPosition(x, y);
			this.setImage('shooter.png');
			// フレーム処理
			this.addEventListener('enterframe', function(){
				// 敵に衝突したときの処理
				this._hitEnemy(this, enemyArr, me);
				// コントロール
				this._controll(me);
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
		_hitEnemy: function(self, arr, me){
			for (var i in arr) {
				if (arr[i].intersect(self)) {
					// 爆発処理
					new Explosion(
						this.x,
						this.y,
						me
					)
					// 敵機インスタンスの削除
					this.game.removeChild(arr[i]);
					console.log( !!(delete arr[i]) );
					// 敵機の体力の減算
					setting.playerHitpoint--;
					// 完全にHPが0の時の処理
					if (setting.playerHitpoint <= 0) {
						console.log('衝突しました');
						this.game.removeChild(self);
						// ゲーム中断
						game.stop();
						// ゲームオーバー
					var gameOver = new Scene();

					gameOver.backgroundColor = 'black';
						game.pushScene(gameOver);
						// ゲームオーバー処理
						//this.gameOver();
					}
				}
			}
		},
		// 操作
		_controll: function(me) {
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
				console.log(me);
				new PlayerBullet(this.x, this.y, me);
			}
		}
	});

	// ###########################
	//    敵機クラス
	// ###########################
	var Enemy = Class.create(Aircraft, {
		initialize: function(x, y, uuid, me) {
			Aircraft.call(this, 32, 32, uuid, me);
			// ポジションと画像とフレームの切り替え
			this.setPosition(x, y);
			return this;
		}
	});

	// ###########################
	//    雑魚的クラス
	// ###########################
	var ZakoEnemy = Class.create(Enemy, {
		initialize: function(x, y, uuid, me) {
			Enemy.call(this, x, y, uuid, me);
			this.setFrame([4, 5]);
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
					new EnemyBullet(this.x - this.width, this.y, me);
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
		initialize: function(x, y, uuid, me) {
			Enemy.call(this, x, y, uuid, me);
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
					new EnemyBullet(this.x - this.width, this.y, me);
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
	//    モノのクラス(item, bulletが継承する)
	// ###########################
	var Things = Class.create(SuperSprite, {
		initialize: function(x, y, me) {
			SuperSprite.call(this, x, y, me);
			return this;
		},
		// アイテムやバレット（自機、敵機）が敵機や自機に衝突した時の処理	
		hitEntity: function(self, arr, me, callback) {
			// 衝突判定
			for (var i in arr) {
				if (arr[i].intersect(self)) {
					// モノは確実に削除する
					this.game.removeChild(self);
					// コールバック
					if (callback) callback(arr, i, me);
				}
			}
		}
	});

	// ###########################
	//    球クラス(球の衝突や)
	// ###########################
	var Bullet = Class.create(Things, {
		initialize: function(x, y, me) {
			Things.call(this, x, y, me);
			return this;
		}				
	});

	// ###########################
	//    実機玉子クラス
	// ###########################
	var PlayerBullet = Class.create(Bullet, {
		initialize: function(x, y, me) {
			Bullet.call(this, 16, 16, me);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/4 + y);
			this.setImage('icon0.png');
			this.setFrame([50]);
			this.addInstance(this);
			var self = this; // コンテキストの避難
			this.addEventListener('enterframe', function(){
				// 球の速度
				self.x += setting.playerBulletAgility;
				// ヒット処理
				self.hitEntity(self, enemyArr, me, function(arr, i, me){
					// 爆発しろ
					new Explosion(
						self.x,
						self.y,
						me
					);
					// 速度オプションの変更(上限を超えない範囲で)
					setting.gamePoint += 3;
					// 敵の画像を削除する
					self.removeInstance(arr[i]);
					// 敵の配列を削除する
					console.log( !!(delete arr[i]) );
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
	var EnemyBullet = Class.create(Bullet, {
		initialize: function(x, y, me) {
			Bullet.call(this, 16, 16, me);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/2 + y);
			this.setImage('icon0.png');
			this.setFrame([62]);
			this.addInstance(this);
			var self = this;
			this.addEventListener('enterframe', function(){
				// 球の発射速度
				self.x -= setting.playerBulletAgility;
				// 自機とのヒット処理
				self.hitEntity(self, playerArr, me, function(arr, i, me){
					// Note: 自機の画像も自機の配列の要素も削除しない
					// 回復オプションの変更(上限を超えない範囲で)
					if (setting.playerHitpoint != setting.minPlayerHitpoint) {
						// 爆発処理(敵に当たった時なのでselfを使用する)
						new Explosion(
							self.x,
							self.y,
							me
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
		initialize: function(x, y, me) {
			Bullet.call(this, 16, 16, me);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/2 + y);
			this.setImage('icon0.png');
			this.setFrame([62]);
			this.addInstance(this);
			var self = this;
			this.addEventListener('enterframe', function(){
				// 球の発射速度
				self.x -= setting.playerBulletAgility;
				// 自機とのヒット処理
				self.hitEntity(self, playerArr, me, function(arr, i, me){
					// Note: 自機の画像も自機の配列の要素も削除しない
					// 回復オプションの変更(上限を超えない範囲で)
					if (setting.playerHitpoint != setting.minPlayerHitpoint) {
						// 爆発処理(敵に当たった時なのでselfを使用する)
						new Explosion(
							self.x,
							self.y,
							me
						);
						setting.playerHitpoint -= 2;
					} else {
						// ゲームオーバー処理
						console.log('GAME OVER');
						// ゲーム中断
						//game.stop();
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
		initialize: function(x, y, me) {
			Things.call(this, x, y, me); // 最初の位置
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
		initialize: function(x, y, me) {
			Item.call(this, 16, 16, me); // 最初の位置
			this.setPosition(x, y); // ポジションを変える
			this.setImage('icon0.png');
			this.setFrame([10]); // 回復アイテム
			this.addInstance(this);
			var self = this; // コンテキストの避難
			this.addEventListener('enterframe', function(){
				// ヒット処理
				self.hitEntity(self, playerArr, me, function(arr, i, me){
					// Note: ここでは自機の画像削除も配列の要素の削除も行わない
					// 回復演出
					new Cure(
						self.x,
						self.y,
						me
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
		initialize: function(x, y, me) {
			Item.call(this, 16, 16, me); // 最初の位置
			this.setPosition(x, y); // ポジションを変える
			this.setImage('icon0.png');
			this.setFrame([13]); // 回復アイテム
			this.addInstance(this);
			var self = this;
			this.addEventListener('enterframe', function(){
				// Note: ここでは自機の画像削除も配列の要素の削除も行わない
				// ヒット処理
				self.hitEntity(self, playerArr, me, function(arr, i, me){
					// 回復処理
					new Cure(
						self.x,
						self.y,
						me
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
	/*
	var Expression = Class.create(SuperSprite, {
		initialize: function(x, y) {
		}
	});
	*/
	// ###########################
	//    爆発演出クラス
	// ###########################
	var Explosion = Class.create(SuperSprite, {
		// コンストラクタ
		initialize: function(x, y, me){
			SuperSprite.call(this, 16, 16, me);
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
		initialize: function(x, y, me){
			SuperSprite.call(this, 16, 16, me);
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


	// エクスポート
	window.sub = {
		Aircraft: Aircraft,
		Player: Player,
		Enemy: Enemy,
		ZakoEnemy: ZakoEnemy,
		ZakoEnemy2: ZakoEnemy2,
		Things: Things,
		Bullet: Bullet,
		PlayerBullet: PlayerBullet,
		EnemyBullet: EnemyBullet,
		EnemyBullet2: EnemyBullet2,
		Item: Item,
		RecoveryItem: RecoveryItem,
		SpeedItem: SpeedItem,
		Explosion: Explosion,
		Cure: Cure
	};


});