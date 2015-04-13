 $(document).ready(function(){

	// #####################################
	//        　    インポート
	// #####################################
	var game = window.game.game,
		setting = window.game.setting,
		files = window.game.files,
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
			this.sound = game.assets[files.fired].clone(); //　音楽用
			// フレーム処理
			var self = this;
			this.addEventListener('enterframe', function(){
				// 敵の処理
				for (var i in enemyArr) {
					if (enemyArr[i].intersect(self)) {
						if (enemyArr[i].type == setting.enemyTypeThreeBody ||
							enemyArr[i].type == setting.enemyTypeThreeHead ||
							enemyArr[i].type == setting.enemyTypeThreeBodyRibon ||
							enemyArr[i].type == setting.enemyTypeThreeHeadRibon) {
							//self._hitBoss(arr, i, self, pg);
							console.log('ボスとあたる');
							self._crashBoss(enemyArr, i, pg);
						} else { // 通常敵の時の処理
							console.log('普通の敵と当たる');
							//self._hitEnemy(arr, i, self, pg);
						}
					}
				}
				// 敵に衝突したときの処理
				//this._crashEnemy(this, enemyArr, pg);
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
		_crashEnemy: function(arr, i, pg){
			//for (var i in arr) {
			//	if (arr[i].intersect(self)) {
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
						this.pg.removeChild(this);
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
			//	}
			//}
		},
		_crashBoss: function(arr, i, pg) {
			//for (var i in arr) {
			//	if (arr[i].intersect(self)) {
					// 爆発処理
					new Explosion(
						this.x,
						this.y,
						pg
					)
					// 敵機の削除
					//this.pg.removeChild(arr[i]);
					// 敵機の要素を削除。（そうしなければ、何度も判定するから）
					//delete arr[i];
					// 敵機の体力の減算
					store.playerHitpoint--;
					// 完全にHPが0の時の処理
					if (store.playerHitpoint == 0) {
						// 自機の削除処理
						this.pg.removeChild(this);
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
			//	}
			//}
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
				this.setFrame((this.frame == 1) ? 0 : 1);
			}
			// 発射処理
			if (game.input.space && game.frame % 2 == 0) {
				// ミサイル
				new PlayerBullet(this.x, this.y, pg);
				// 音鳴らす
				if (store.music) this.sound.play();
			}
		}
	});

	// ###########################
	//    敵機クラス
	// ###########################
	var Enemy = Class.create(Aircraft, {
		initialize: function(width, height, x, y, uuid, pg, type) {
			Aircraft.call(this, width, height, uuid, pg);
			// ポジションと画像とフレームの切り替え
			this.setPosition(x, y);
			// 敵の種類を保存する
			this.setType(type);
			// 敵の種類に応じて体力の設定
			this.setHitpoint();
			// メソッドチェーン
			return this;
		},
		// 敵の種類の識別番号を保存する
		setType: function(type) {
			this.type = type;
		},
		// ヒットポイントの設定
		setHitpoint: function() {
			switch (this.type){
			  case setting.enemyTypeOne:
			    this.hitpoint = setting.enemyTypeOneHitpoint;
			    break;
			  case setting.enemyTypeTwo:
			    this.hitpoint = setting.enemyTypeTwoHitpoint;
			    break;
			  case setting.enemyTypeThreeHead:
			    this.hitpoint = setting.enemyTypeThreeHeadHitpoint;
			    break;
			  case setting.enemyTypeThreeHeadRibon:
			    this.hitpoint = setting.enemyTypeThreeHeadRibonHitpoint;
			    break;
			  case setting.enemyTypeThreeBody:
			    this.hitpoint = setting.enemyTypeThreeBodyHitpoint;
			    break;
			  case setting.enemyTypeThreeBodyRibon:
			    this.hitpoint = setting.enemyTypeThreeBodyRibonHitpoint;
			    break;
			}
		}
	});

	// ###########################
	//    雑魚的クラス
	// ###########################
	var ZakoEnemy = Class.create(Enemy, {
		initialize: function(x, y, uuid, pg) {
			Enemy.call(this, 32, 32, x, y, uuid, pg, setting.enemyTypeOne);
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
			//this.y = Math.cos ( this.x * Math.PI / 180 ) * 220 + 300;
		}
	});

	// ###########################
	//    雑魚敵クラス2
	// ###########################
	var ZakoEnemy2 = Class.create(Enemy, {
		initialize: function(x, y, uuid, pg) {
			Enemy.call(this, 32, 32, x, y, uuid, pg, setting.enemyTypeTwo);
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
					new EnemyBullet2(this.x - this.width, this.y, pg);
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
	//    ボスの基本クラス
	// ###########################
	var BossEnemy = Class.create(Enemy, {
		initialize: function(width, height ,x, y, uuid, pg, type) {
			Enemy.call(this, width, height, x, y, uuid, pg, type);
		},
		// 敵を動かす
		move: function() {
			this.tl.moveBy(
						-100,
						100,
						30,
						enchant.Easing.QUAD_EASEINOUT
					)
					.moveBy(
						+100,
						-100,
						30,
						enchant.Easing.QUAD_EASEINOUT
					)
					.moveBy(
						-100,
						-100,
						30,
						enchant.Easing.QUAD_EASEINOUT
					)
					.moveBy(
						+100,
						+100,
						30,
						enchant.Easing.QUAD_EASEINOUT
					)
					.loop();
		},
		// 登場アクション
		action: function() {
			this.tl.moveBy(
				setting.gameWidth/5,
				1,
				30,
				enchant.Easing.QUAD_EASEINOUT
			); // (200,0 )に90フレーデ絶対位置でイージングで移動		
		},
		// 死にアクション
		die: function() {

		}
	});

	// ###########################
	//    ボスの頭
	// ###########################
	var BossEnemyHead = Class.create(BossEnemy, {
		initialize: function(x, y, uuid, pg) {
			BossEnemy.call(this, 180, 243, x, y, uuid, pg, setting.enemyTypeThreeHead);
			this.setFrame([1]);
			this.setImage('mie_h.png');
			this.addInstance(this);
			// 敵の玉の発射処理
			var self = this;
			// アクション
			this.action();
			// イベントリスナー
			this.addEventListener('enterframe', function() {
				this.move();
				// 点滅処理
				if (self.hitpoint==0) {
					self.opacity = (self.opacity == 0.7) ? 0.5 : 0.7;
				}
			});
		}
	});

	// ###########################
	//    ボスの体
	// ###########################
	var BossEnemyBody = Class.create(BossEnemy, {
		initialize: function(x, y, uuid, pg) {
			BossEnemy.call(this, 125, 146, x, y, uuid, pg, setting.enemyTypeThreeBody);
			this.setFrame([1]);
			this.setImage('body_h.png');
			this.addInstance(this);
			// 敵の玉の発射処理
			var self = this;
			// アクション
			this.action();
			// 動きの処理
			this.addEventListener('enterframe', function() {
				this.move();
				// 点滅処理
				if (self.hitpoint==0) {
					self.opacity = (self.opacity == 0.7) ? 0.5 : 0.7;
				}
			});
		}
	});

	// ###########################
	//    ボスの頭のリボン
	// ###########################
	var BossEnemyHeadRibon = Class.create(BossEnemy, {
		initialize: function(x, y, uuid, pg) {
			BossEnemy.call(this, 91, 66, x, y, uuid, pg, setting.enemyTypeThreeHeadRibon);
			this.setFrame([1]);
			this.setImage('ribon_h.png');
			this.addInstance(this);
			// 敵の玉の発射処理
			var self = this;
			// アクション
			this.action();
			this.addEventListener('enterframe', function() {
				this.move();
				// 点滅処理
				if (self.hitpoint==0) {
					self.opacity = (self.opacity == 0.7) ? 0.5 : 0.7;
				}
			});
		}
	});


	// ###########################
	//    ボスの体のリボン
	// ###########################
	var BossEnemyBodyRibon = Class.create(BossEnemy, {
		initialize: function(x, y, uuid, pg) {
			BossEnemy.call(this, 59, 46, x, y, uuid, pg, setting.enemyTypeThreeBodyRibon);
			this.setFrame([1]);
			this.setImage('ribon2_h.png');
			this.addInstance(this);
			// 敵の玉の発射処理
			var self = this;
			// アクション
			this.action();

			this.addEventListener('enterframe', function() {
				this.move();
			});
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
	//    実機弾子クラス
	// ###########################
	var PlayerBullet = Class.create(Bullet, {
		initialize: function(x, y, pg) {
			Bullet.call(this, 16, 16, pg);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/4 + y);
			this.setImage('icon0.png');
			this.setFrame([50]);
			this.bulletSound = game.assets[files.hittedSound].clone(); // 球の音
			this.enemyCrashed = game.assets[files.enemyCrashed].clone(); // 敵の爆破音
			this.addInstance(this);
			//this.sound = game.assets[files.hittedSound].clone(); // ヒット時の音楽
			var self = this; // コンテキストの避難
			this.addEventListener('enterframe', function(){
				// 球の速度
				self.x += setting.playerBulletAgility;
				// ヒット処理
				self.hitEntity(self, enemyArr, pg, function(arr, i, pg){
					// ボスと非ボスで処理を切り替える
					if (arr[i].type == setting.enemyTypeThreeBody ||
						arr[i].type == setting.enemyTypeThreeHead ||
						arr[i].type == setting.enemyTypeThreeBodyRibon ||
						arr[i].type == setting.enemyTypeThreeHeadRibon) {
						self._hitBoss(arr, i, self, pg);
					} else { // 通常敵の時の処理
						self._hitEnemy(arr, i, self, pg);
					}
				});
				// 画面外に出る処理
				self.getOut(self, null);
			});
			return this;
		},
		// 普通の敵に当たった時の処理
		_hitEnemy: function(arr, i, self, pg) {
			// 爆発しろ
			new Explosion(
				self.x,
				self.y,
				pg
			);
			// サウンド再生
			//console.log(store.music);
			if (store.music) this.bulletSound.play();
			// 当たった敵の体力をデクリメント
			arr[i].hitpoint--;
			// もしリボンのHPがゼロなら削除
			if (arr[i].hitpoint == 0) {
				// 速度オプションの変更(上限を超えない範囲で)
				store.gamePoint += 3;
				// 敵の画像を削除する
				self.removeInstance(arr[i]);
				// 敵の配列を削除する
				delete arr[i];
				// 敵の爆発音
				if (store.music) this.enemyCrashed.play();
			}
		},
		// ボスに当たった時の処理
		_hitBoss: function(arr, i, self, pg) {
			// リボンのはかい
			if (store.flag == false) {
				if (arr[i].type == setting.enemyTypeThreeHeadRibon) {
					// 爆発しろ
					new Explosion(
						self.x,
						self.y,
						pg
					);
					// 当たった敵の体力をデクリメント
					arr[i].hitpoint--;
					// もしリボンのHPがゼロなら削除
					if (arr[i].hitpoint == 0) {
						// 速度オプションの変更(上限を超えない範囲で)
						store.gamePoint += 3;
						// 敵の画像を削除する
						self.removeInstance(arr[i]);
						// 敵の配列を削除する
						delete arr[i];
						//　フラグを本気モードに
						store.flag = true;
					}
				} else {
					// 別エフェクト
					new Cure(
						self.x,
						self.y,
						pg
					);
				}
			} else { // 
				// 当たった敵の体力をデクリメント
				arr[i].hitpoint--;
				// ヒットポイントがゼロなら色を
				if (arr[i].hitpoint == 0) {
					delete arr[i];
				} else {
					// 爆発しろ
					new Explosion(
						self.x,
						self.y,
						pg
					);
				}
				// 敵の配列を全部チェックする（arr.lengthが使えないため）
				var flag3 = false;
				for(key in enemyArr) {
					flag3 = true;
				}
				if (!flag3) {
					console.log('終了！！！！！！！！！！！！！！！！！！！！！！！！！！！');
					store.currentScene = 'gameover';
				}
			}
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
					if (store.playerHitpoint <= 0) {
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
	//    敵機玉子クラス
	// ###########################
	var EnemyBullet2 = Class.create(Bullet, {
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
					store.playerHitpoint -= 2;
					// ゲームオーバー処理
					if (store.playerHitpoint <= 0) {
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
	//   　　ボスバレット
	// ###########################
	var BossBullet = Class.create(Bullet, {
		initialize: function(x, y, pg) {
			Bullet.call(this, 16, 16, pg);
			this.setPosition(setting.playerWidth + x, setting.playerHeight/2 + y);
			this.setImage('icon0.png');
			this.setFrame([62]);
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
			// アイテムゲット時の音楽
			this.sound = game.assets[files.getItem].clone();
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
					// 回復音
					if (store.music) self.sound.play();
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
					if (store.music) self.sound.play();
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
		// 機体
		Aircraft: Aircraft,
		Player: Player,
		Enemy: Enemy,
		ZakoEnemy: ZakoEnemy,
		ZakoEnemy2: ZakoEnemy2,
		BossEnemy: BossEnemy,
		BossEnemyHead: BossEnemyHead,
		BossEnemyBody: BossEnemyBody,
		BossEnemyHeadRibon: BossEnemyHeadRibon,
		BossEnemyBodyRibon: BossEnemyBodyRibon,
		// アイテムや球
		Things: Things,
		Bullet: Bullet,
		PlayerBullet: PlayerBullet,
		EnemyBullet: EnemyBullet,
		EnemyBullet2: EnemyBullet2,
		BossBullet: BossBullet,
		Item: Item,
		RecoveryItem: RecoveryItem,
		SpeedItem: SpeedItem,
		// エフェクト
		Explosion: Explosion,
		Cure: Cure
	};

});