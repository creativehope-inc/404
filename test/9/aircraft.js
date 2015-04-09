$(document).ready(function() {

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
			initialize: function(x, y, uuid, me){
				SuperSprite.call(this, x, y, me);
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
			initialize: function(x, y, uuid, me) {
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
							game.pushScene(gameOver);
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



	// エクスポート
	window.sub = {
		Aircraft: Aircraft,
		Player: Player,
		Enemy: Enemy,
		ZakoEnemy: ZakoEnemy,
		ZakoEnemy2: ZakoEnemy2
	};


});