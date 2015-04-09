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
		initialize: function(x, y, uuid, pg){ // meはplayGameインスタンス、goはGameOverインスタンス
			SuperSprite.call(this, x, y, pg);
			// UUIDの保存
			this._setUUID(uuid);
			// チェーン用
			return this;
		},
		// ストアでオブジェクトを破壊するためにUUIDを保存しておく
		_setUUID: function(uuid) {
			this.uuid = uuid;
			return this;
		},
		// 配列に保存する用のメソッド
		saveStore: function(arr) {
			arr[this.uuid] = this;
			return this;
		}
	});

	// ###########################
	//    プレイヤー クラス　
	// ###########################
	var Player = Class.create(Aircraft, {
		initialize: function(x, y, uuid, pg, go) {
			// キャラクター
			Aircraft.call(this, 32, 32, uuid, pg);
			this.setPosition(x, y);
			this.setImage('shooter.png');
			// フレーム処理
			this.addEventListener('enterframe', function(){
				// 敵に衝突したときの処理
				this._hitEnemy(this, enemyArr, pg);
				// コントロール
				this._controll(pg);
			});
			// 最後に機体の追加
			this.addInstance(this);
			// プレイヤーの出現処理
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
		_hitEnemy: function(self, arr, pg){
			for (var i in arr) {
				if (arr[i].intersect(self)) {
					// 爆発処理
					new Explosion(
						this.x,
						this.y,
						pg
					)
					// 敵機の削除
					this.pg.removeChild(arr[i]);
					// 敵機の要素を削除。（そうしなければ、何度も判定するから）
					delete arr[i];
					// 敵機の体力の減算
					store.playerHitpoint--;
					// 完全にHPが0の時の処理
					if (store.playerHitpoint == 0) {
						// 自機の削除処理
						this.pg.removeChild(self);
						// ゲームオーバー
						store.currentScene = 'gameover';
						// 該当要素を削除する
						for (key in enemyArr) {
							delete enemyArr[key];
						}
						for (key in playerArr) {
							delete playerArr[key];
						}
					}
				}
			}
		},
		// 操作
		_controll: function(pg) {
			// フレーム処理
			// 画像の切り替え			  	
		  	this.setFrame([0,1]);
		  	// キャラクターの操作処理
			if (game.input.left && this.x >0) {
				this.x -= store.playerAgility;
			}
			if (game.input.right && this.x <setting.gameWidth - this.width) {
				this.x += store.playerAgility;
			}
			if (game.input.up && this.y >0) {
				this.y -= store.playerAgility;
				this.frame = 2;		
			}
			if (game.input.down && this.y <setting.gameHeight - this.height) {
				this.y += store.playerAgility;
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
				new PlayerBullet(this.x, this.y, pg);
			}
		}
	});

	// ###########################
	//    敵機クラス
	// ###########################
	var Enemy = Class.create(Aircraft, {
		initialize: function(x, y, uuid, pg) {
			Aircraft.call(this, 32, 32, uuid, pg);
			// ポジションと画像とフレームの切り替え
			this.setPosition(x, y);
			return this;
		}
	});

	// ###########################
	//    雑魚的クラス
	// ###########################
	var ZakoEnemy = Class.create(Enemy, {
		initialize: function(x, y, uuid, pg) {
			Enemy.call(this, x, y, uuid, pg);
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
					new EnemyBullet(this.x - this.width, this.y, pg);
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
	//    モノのクラス(item, bulletが継承する)
	// ###########################
	var Things = Class.create(SuperSprite, {
		initialize: function(x, y, pg) {
			SuperSprite.call(this, x, y, pg);
			return this;
		},
		// アイテムやバレット（自機、敵機）が敵機や自機に衝突した時の処理	
		hitEntity: function(self, arr, pg, callback) {
			// 衝突判定
			for (var i in arr) {
				//if (arr[i].intersect(self)) {
				if (self.intersect(arr[i])) {
					// モノは確実に削除する
					this.pg.removeChild(self);
					// コールバック
					if (callback) callback(arr, i, pg);
				}
			}
		}
	});

	// ###########################
	//    球クラス(球の衝突や)
	// ###########################
	var Bullet = Class.create(Things, {
		initialize: function(x, y, pg) {
			Things.call(this, x, y, pg);
			return this;
		}				
	});

	// ###########################
	//    実機玉子クラス
	// ###########################
	var PlayerBullet = Class.create(Bullet, {
		initialize: function(x, y, pg) {
			Bullet.call(this, 16, 16, pg);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/4 + y);
			this.setImage('icon0.png');
			this.setFrame([50]);
			this.addInstance(this);
			var self = this; // コンテキストの避難
			this.addEventListener('enterframe', function(){
				// 球の速度
				self.x += setting.playerBulletAgility;
				// ヒット処理
				self.hitEntity(self, enemyArr, pg, function(arr, i, pg){
					// 爆発しろ
					new Explosion(
						self.x,
						self.y,
						pg
					);
					// 速度オプションの変更(上限を超えない範囲で)
					store.gamePoint += 3;
					// 敵の画像を削除する
					self.removeInstance(arr[i]);
					// 敵の配列を削除する
					delete arr[i];
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
		initialize: function(x, y, pg) {
			Bullet.call(this, 16, 16, pg);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/2 + y);
			this.setImage('icon0.png');
			this.setFrame([62]);
			this.addInstance(this);
			var self = this;
			this.addEventListener('enterframe', function(){
				// 球の発射速度
				self.x -= setting.playerBulletAgility;
				// 自機とのヒット処理
				self.hitEntity(self, playerArr, pg, function(arr, i, pg){
					// Note: 自機の画像も自機の配列の要素も削除しない
					// 回復オプションの変更(上限を超えない範囲で)
					new Explosion(
						self.x,
						self.y,
						pg
					);
					// 体力減算
					store.playerHitpoint--;
					// ゲームオーバー処理
					if (store.playerHitpoint == 0) {
						// ゲームオーバー
						store.currentScene = 'gameover';
						// 対象要素のみ削除
						for (key in playerArr) {
							delete playerArr[key];
						}
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
		initialize: function(x, y, pg) {
			Things.call(this, x, y, pg); // 最初の位置
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
		initialize: function(x, y, pg) {
			Item.call(this, 16, 16, pg); // 最初の位置
			this.setPosition(x, y); // ポジションを変える
			this.setImage('icon0.png');
			this.setFrame([10]); // 回復アイテム
			this.addInstance(this);
			var self = this; // コンテキストの避難
			this.addEventListener('enterframe', function(){
				// ヒット処理
				self.hitEntity(self, playerArr, pg, function(arr, i, pg){
					// Note: ここでは自機の画像削除も配列の要素の削除も行わない
					// 回復演出
					new Cure(
						self.x,
						self.y,
						pg
					);
					// 回復オプションの変更(上限を超えない範囲で)
					if (store.playerHitpoint < setting.maxPlayerHitpoint) {
						store.playerHitpoint++;
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
		initialize: function(x, y, pg) {
			Item.call(this, 16, 16, pg); // 最初の位置
			this.setPosition(x, y); // ポジションを変える
			this.setImage('icon0.png');
			this.setFrame([13]); // 回復アイテム
			this.addInstance(this);
			var self = this;
			this.addEventListener('enterframe', function(){
				// Note: ここでは自機の画像削除も配列の要素の削除も行わない
				// ヒット処理
				self.hitEntity(self, playerArr, pg, function(arr, i, pg){
					// 回復処理
					new Cure(
						self.x,
						self.y,
						pg
					);
					// 速度オプションの変更(上限を超えない範囲で)
					if (store.playerAgility < setting.maxPlayerAgility ) {
						store.playerAgility += 5;
					}
				});
			});
			return this;
		}
	});

	// ###########################
	//    爆発演出クラス
	// ###########################
	var Explosion = Class.create(SuperSprite, {
		// コンストラクタ
		initialize: function(x, y, pg){
			SuperSprite.call(this, 16, 16, pg);
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
		initialize: function(x, y, pg){
			SuperSprite.call(this, 16, 16, pg);
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
		//ZakoEnemy2: ZakoEnemy2,
		Things: Things,
		Bullet: Bullet,
		PlayerBullet: PlayerBullet,
		EnemyBullet: EnemyBullet,
		//EnemyBullet2: EnemyBullet2,
		Item: Item,
		RecoveryItem: RecoveryItem,
		SpeedItem: SpeedItem,
		Explosion: Explosion,
		Cure: Cure
	};


});