var sub = ( function(){

	return function ( gamer, superClass ) {
		// #####################################
		//             インポート
		// #####################################

		var game     	= gamer.game,
			setting 	= gamer.setting,
			files 		= gamer.files,
			store      	= gamer.store,
			playerArr	= gamer.playerArr,
			enemyArr 	= gamer.enemyArr,
			itemArr  	= gamer.itemArr;

		// スーパーの設定
		var SuperLabel  = superClass.SuperLabel,
			SuperSprite = superClass.SuperSprite;

		// ###########################
		//    機体クラス(全てのエンティティを保存する)
		// ###########################
		var Aircraft = Class.create( SuperSprite , {
			// コンストラクタ
			initialize: function( x, y, uuid, pg ){ // meはplayGameインスタンス、goはGameOverインスタンス
				SuperSprite.call( this, x, y, pg );
				// UUIDの保存
				this._setUUID( uuid );
				// チェーン用
				return this;
			},
			// ストアでオブジェクトを破壊するためにUUIDを保存しておく
			_setUUID: function( uuid ) {
				this.uuid = uuid;
				return this;
			},
			// 配列に保存する用のメソッド
			saveStore: function( arr ) {
				arr[ this.uuid ] = this;
				return this;
			}
		} );

		// #################################################################################
		//    プレイヤー クラス
		// #################################################################################
		var Player = Class.create( Aircraft, {
			initialize: function( x, y, uuid, pg, go ) {
				// キャラクター
				Aircraft.call( this, 32, 32, uuid, pg );
				this.setPosition( x, y );
				this.setImage( files.shooter );
				this.fired = game.assets[ files.fired ].clone(); // 音楽用
				this.enemyCrashed = game.assets[ files.enemyCrashed ].clone(); // 音楽用	
				this.bossCrashed = game.assets[ files.bossCrashed ].clone(); // 音楽用  	

				// フレーム処理
				var self = this;
				this.addEventListener( 'enterframe', function(){
					// 敵の処理
					for ( var i in enemyArr ) {
						if ( enemyArr[ i ].intersect( self ) ) {
							if ( enemyArr[ i ].type == setting.enemyTypeThreeBody ||
								enemyArr[ i ].type == setting.enemyTypeThreeHead ||
								enemyArr[ i ].type == setting.enemyTypeThreeBodyRibon ||
								enemyArr[ i ].type == setting.enemyTypeThreeHeadRibon ) {
								// ボスとの衝突処理
								self._crashBoss( enemyArr, i, pg, self );
							} else {
								// 通常敵の時の処理
								self._crashEnemy( enemyArr, i, self, pg );
							}
						}
					}
					// ゲームオーバー確認処理
					this._checkHP( pg );
					// コントロール処理
					this._controll( pg );
				} );
				// 最後に機体の追加
				this.addInstance( this );
				// プレイヤーの出現処理
				this._came();
				// メソッドチェーン
				return this;
			},
			// 来たときの処理
			_came: function() {
				// プレイヤーの初期移動処理
				this.tl.moveBy( setting.gameWidth / 2, 1, 30, enchant.Easing.QUAD_EASEINOUT )
						.and().rotateTo( 360 * 10, 30, enchant.Easing.LINEAR )
						.and().scaleTo( 3, 3, 30 )
						.and().rotateTo( 360 * 10, 30, enchant.Easing.LINEAR )
						.moveTo( 0, setting.gameHeight / 2, 30 )
						.and().scaleTo( 1, 1, 30 ); // 絶対位置に移動
				// メソッドチェーン
				return this;
			},
			// 敵機との直接衝突処理（敵機は即削除する）
			_crashEnemy: function( arr, i, self, pg ){
				// 爆発処理
				new Explosion(
					this.x,
					this.y,
					pg
				);
				// 自機の体力の減算
				if ( !( store.playerHitpoint <= 0 ) ) store.playerHitpoint -= setting.enemyPower;
				// 敵の体力の削減
				arr[i].hitpoint -= 3;
				// 音鳴らす
				if ( store.music ) this.enemyCrashed.play();
			},
			_crashBoss: function( arr, i, pg, self ) {
				new Explosion(
					this.x,
					this.y,
					pg
				);
				// 敵機の体力の減算
				if ( !( store.playerHitpoint <= 0 ) ) store.playerHitpoint -= setting.enemyPower;
				// 敵の体力の削減
				arr[ i ].hitpoint -= 3;
				// 音鳴らす
				if ( store.music ) self.bossCrashed.play();
			},
			// 操作処理
			_controll: function( pg ) {
				// フレーム処理
				// 画像の切り替え				
				this.setFrame( [ 0, 1 ] );
				// キャラクターの操作処理
				if ( game.input.left && this.x > 0 ) {
					this.x -= store.playerAgility;
				}
				if ( game.input.right && this.x < setting.gameWidth - this.width ) {
					this.x += store.playerAgility;
				}
				if ( game.input.up && this.y > 0 ) {
					this.y -= store.playerAgility;
					this.frame = 2;		
				}
				if ( game.input.down && this.y < setting.gameHeight - this.height ) {
					this.y += store.playerAgility;
					this.frame = 3;
				}
				if ( game.input.up == false && game.input.down == false )  {
					this.setFrame( ( this.frame == 1 ) ? 0 : 1 );
				}
				// 発射処理
				if ( game.input.space && game.frame % 2 == 0 ) {
					// ミサイル
					new PlayerBullet( this.x, this.y, pg );
					// 音鳴らす
					if ( store.music ) this.fired.play();
				}
			},
			// プレイヤーのHPの確認処理(０以下だとゲームオーバー)
			_checkHP: function( pg ) {
				if ( store.playerHitpoint <= 0 ) {
				 	// 自機の削除処理
				 	this.removeInstance( this );
				 	// ゲームオーバー大爆発処理
				 	for (var i = - 10; i < 10; i++ ) {
				 		for (var j = -10; j < 10; j++ ) {
				 			new Explosion(
				 				this.x + j * 5,
				 				this.y + i * 5,
				 				pg
				 			);
				 		}
				 	}
				 	// ゲームオーバーにする
				 	setTimeout( function() {
				 		store.currentScene = 'gameover';
				 	}, 2000 );
				}			
			}
		} );

		// ###########################
		//    敵機クラス
		// ###########################
		var Enemy = Class.create( Aircraft, {
			initialize: function( width, height, x, y, uuid, pg, type ) {
				Aircraft.call( this, width, height, uuid, pg );
				// ポジションと画像とフレームの切り替え
				this.setPosition( x, y );
				// 敵の種類を保存する
				this.setType( type );
				// 敵の種類に応じて体力の設定
				this.setHP();
				// メソッドチェーン
				return this;
			},
			// 敵の種類の識別番号を保存する <<---------------------------------------------------------------
			setType: function( type ) {
				this.type = type;
			},
			// ヒットポイントの設定(雑魚敵もボス敵もHPプロパティに体力を追加する)
			setHP: function() {
				switch ( this.type ){
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
				    this.hitpoint = setting.enemyTypeThreeHeadRibbonHitpoint;
				    break;
				  case setting.enemyTypeThreeBody:
				    this.hitpoint = setting.enemyTypeThreeBodyHitpoint;
				    break;
				  case setting.enemyTypeThreeBodyRibon:
				    this.hitpoint = setting.enemyTypeThreeBodyRibbonHitpoint;
				    break;
				}
			},
			// 要素のカウント時の処理(敵のタイプによって敵のカウンターを追加する)
			addCounter: function( element ) {
				switch( element.type ) {
					case setting.enemyTypeOne:
						store.zakoEnemyCounter++;
						store.gamePoint += setting.enemyTypeOne;
						break;
					case setting.enemyTypeTwo:
						store.zakoEnemy2Counter++;
						store.gamePoint += setting.enemyTypeTwo;
						break;
					case setting.enemyTypeThreeHead:
						store.bossHeadCounter++;
						store.gamePoint += setting.enemyTypeThreeHead;
						break;
					case setting.enemyTypeThreeHeadRibon:
						store.bossHeadRibonCounter++;
						store.gamePoint += setting.enemyTypeThreeHeadRibon;
						break;
					case setting.enemyTypeThreeBody:
						store.bossBodyCounter++;
						store.gamePoint += setting.enemyTypeThreeBody;
						break;
					case setting.enemyTypeThreeBodyRibon:
						store.bossBodyRibonCounter++;
						store.gamePoint += setting.enemyTypeThreeBodyRibon;
						break;
				}
			},
		} );
		// #################################################################################
		//    雑魚ベースクラス
		// #################################################################################
		var ZakoBase = Class.create( Enemy, {
			initialize: function( x, y, uuid, pg ) {
				Enemy.call( this, 32, 32, x, y, uuid, pg, setting.enemyTypeOne );
			},
			// 敵の体力を確認(もし体力が0以下なら、このインスタンスを削除する)
			_checkHP: function(self) {
				if ( this.hitpoint <= 0 ) {
					// 画面から敵要素を削除（見栄え的問題）
					!!( this.removeInstance( this ) );
					// 敵リストから敵要素を削除。（そうしなければ、何度も判定するから）
					!!( delete enemyArr[ this.uuid ]);
					// 音を鳴らす
					if ( store.music ) this.enemyCrashed.play();
					// 得点を挙げる
					this.addCounter( self );
					// インスタンスの削除
					delete this;
				}
			}
		} );

		// ###########################
		//    雑魚的クラス
		// ###########################
		var ZakoEnemy = Class.create( ZakoBase, {
			initialize: function( x, y, uuid, pg ) {
				Enemy.call( this, 32, 32, x, y, uuid, pg, setting.enemyTypeOne );
				this.setFrame( [ 4, 5 ] );
				this.setImage( files.shooter );
				this.addInstance( this );
				this.enemyCrashed = game.assets[ files.enemyCrashed ].clone();
				var self = this;
				// イベント処理
				this.addEventListener( 'enterframe' , function( e ){
					// 敵の動きの処理
					self._move();
					// 体力チェック
					self._checkHP(self);
					// 敵の玉の発射処理
					if ( game.frame  % 50 == 0 ) {
						new EnemyBullet( this.x - this.width, this.y, pg );
					} 
					// 敵の排出処理
					self.getOut( self, enemyArr );
				} );
			},
			// 敵の動きを再現する
			_move: function() {
				// 敵の玉の発射処理
				this.x -= setting.enemyAgility;
			}
		} );

		// ###########################
		//    雑魚敵クラス2
		// ###########################
		var ZakoEnemy2 = Class.create(ZakoBase, {
			initialize: function( x, y, uuid, pg ) {
				Enemy.call( this, 32, 32, x, y, uuid, pg, setting.enemyTypeTwo );
				this.setFrame( [ 6, 7 ] );
				this.setImage( files.shooter );
				this.addInstance( this );
				this.enemyCrashed = game.assets[ files.enemyCrashed ].clone();
				// 敵の玉の発射処理
				var self = this;
				// イベント処理
				this.addEventListener('enterframe', function(e){
					// 敵の動きの処理
					self._move();
					// 体力チェック
					self._checkHP(self);
					// 敵の玉の発射処理
					if ( game.frame  % 50 == 0 ) {
						new EnemyBullet2(
							this.x - this.width,
							this.y,
							pg
						);
					}
					// 敵の排出処理
					self.getOut( self, enemyArr );
				} );
			},
			// 敵の動きを再現する
			_move: function() {
				// 敵の玉の発射処理
				this.x -= setting.enemyAgility;
				this.y = Math.cos ( this.x * Math.PI / 180 ) * 220 + 300;
			}
		} );

		// #################################################################################
		//    ボスの基本クラス
		// #################################################################################
		var BossEnemy = Class.create(Enemy, {
			initialize: function( width, height ,x, y, uuid, pg, type ) {
				Enemy.call( this, width, height, x, y, uuid, pg, type );
				this.bossEnter = game.assets[ files.bossEnter ].clone();
				this.bossCrashed = game.assets[ files.bossCrashed ].clone();
				var self = this;
				this.addEventListener( 'enterframe', function() {
					// ふつうモード
					if ( store.MajiFlag == false ) {
						if ( game.frame % 10 == 0 ) {
							var angle = Math.floor( Math.random() * ( 5 + 0 ) + 0 );
							// 発射処理
							new BossBullet1( self.x, self.y, pg, angle );
						}
					// 本気モード
					} else {
						if ( game.frame % 100 == 0 ) {
							// 弾幕処理
							for ( var i = 0; i < 5; i++ ) {
								for ( var j = - 5; j < 5; j++ ) {
									if ( i != 0 && j != 0 ) {
										// 発射処理
										new BossBullet2(
											self.x,
											self.y,
											pg,
											i,
											j
										);
									}
								}
							}
						}
					}
					// 要素の点滅処理
					if ( self.hitpoint == 0 ) {
						self.opacity = ( self.opacity == 0.7 ) ? 0.5 : 0.7;
					}

				} );
			},
			// 敵を動かす
			move: function() {
				this.tl.moveBy( -100, 100, 30, enchant.Easing.QUAD_EASEINOUT )
						.moveBy( +100, -100, 30, enchant.Easing.QUAD_EASEINOUT )
						.moveBy( -100, -100, 30, enchant.Easing.QUAD_EASEINOUT )
						.moveBy( +100, +100, 30, enchant.Easing.QUAD_EASEINOUT )
						.loop();
			},
			// 登場アクション
			action: function() {
				this.tl.moveBy( setting.gameWidth / 5, 1, 30, enchant.Easing.QUAD_EASEINOUT );
				// ボスの出現アクション
				if ( store.music ) this.bossEnter.play();
			},
			// 死にアクション
			die: function() {
			},
			// HPチェック処理
			checkHP: function( self, callback ) {
				if ( self.hitpoint <= 0 ) { // 0以下なら
					// 敵配列から該当要素を削除
					!!( delete enemyArr[ self.uuid ]);
					// 音を鳴らす
					if ( store.music ) self.bossCrashed.play();
					// コールバック実行
					if ( callback ) callback();
					// 戻り値はtrue
					return true;
				}
				return false;
			}
		} );

		// ###########################
		//    ボスの頭
		// ###########################
		var BossEnemyHead = Class.create( BossEnemy, {
			initialize: function( x, y, uuid, pg ) {
				BossEnemy.call( this, 144, 166, x, y, uuid, pg, setting.enemyTypeThreeHead );
				this.setFrame( [ 1 ] );
				this.setImage( files.head );
				this.bossCrashed = game.assets[ files.bossCrashed ].clone();
				this.addInstance( this );
				// 敵の玉の発射処理
				var self = this;
				// アクション
				this.action();
				// イベントリスナー
				var flag = false;
				var naki = false; // 泣き顔フラグ
				this.addEventListener( 'enterframe', function() {
					// 顔の変化を表現
					if ( !store.MajiFlag ) {
						if ( game.frame % 10 == 0 ) {
							( this.frame == 1 ) ? this.setFrame( [ 2 ] ) : this.setFrame( [ 1 ] );
						}
					} else {
						if ( !naki ) {
							// 泣き顔に変化
							self.setImage( files.head_2 );
							self.setFrame( [ 1 ] );
							naki = true;
						}
					}
					// 動き
					this.move();
					// 体力確認
					if ( !flag ) flag = self.checkHP( self, function() {
						// 得点とカウンターを火山
						self.addCounter(self);
					} );
				} );
			}
		} );

		// ###########################
		//    ボスの体
		// ###########################
		var BossEnemyBody = Class.create( BossEnemy, {
			initialize: function( x, y, uuid, pg ) {
				BossEnemy.call( this, 194, 246, x, y, uuid, pg, setting.enemyTypeThreeBody );
				this.setFrame( [ 1 ] );
				this.setImage( files.body );
				this.bossCrashed = game.assets[ files.bossCrashed ].clone();
				this.addInstance( this );
				// 敵の玉の発射処理
				var self = this;
				// アクション
				this.action();
				// 動きの処理
				var flag = false;
				this.addEventListener( 'enterframe', function() {
					// 動き
					this.move();
					// 体力チェック処理
					if ( !flag ) flag = self.checkHP( self, function() {
						// 得点とカウンターを火山
						self.addCounter(self);
					} );
				} );
			}
		} );

		// ###########################
		//    ボスの頭のリボン
		// ###########################
		var BossEnemyHeadRibbon = Class.create(BossEnemy, {
			initialize: function( x, y, uuid, pg ) {
				BossEnemy.call( this, 78, 56, x, y, uuid, pg, setting.enemyTypeThreeHeadRibon );
				this.setFrame( [ 1 ] );
				this.setImage( files.head_r );
				// 爆発音
				this.bossCrashed = game.assets[ files.bossCrashed ].clone();
				this.addInstance( this );
				// 敵の玉の発射処理
				var self = this;
				// アクション
				this.action();
				var flag = false;
				this.addEventListener( 'enterframe', function() {
					// 動き
					self.move();
					// 体力確認
					if ( !flag ) flag = self.checkHP( self, function() {
						// 得点とカウンターを火山
						self.addCounter(self);
						// フラグを本気モードに
						store.MajiFlag = true;
						// インスタンスの削除
						!!( self.removeInstance( self ) );
					} );
				} );
			}
		} );

		// ###########################
		//    ボスの体のリボン
		// ###########################
		var BossEnemyBodyRibbon = Class.create( BossEnemy, {
			initialize: function( x, y, uuid, pg ) {
				BossEnemy.call( this, 40, 31, x, y, uuid, pg, setting.enemyTypeThreeBodyRibon );
				this.setFrame( [ 1 ] );
				this.setImage( files.body_r );
				this.bossCrashed = game.assets[ files.bossCrashed ].clone();
				this.addInstance( this );
				// 敵の玉の発射処理
				var self = this;
				// アクション
				this.action();
				var flag = false;
				this.addEventListener( 'enterframe' , function() {
					this.move();
					// 体力確認
					if ( !flag ) flag = self.checkHP( self, function() {
						// 得点とカウンターを火山
						self.addCounter(self);
					} );
				} );
			}
		} );


		// #################################################################################
		//    モノのクラス(item, bulletが継承する)
		// #################################################################################
		var Things = Class.create( SuperSprite, {
			initialize: function( x, y, pg ) {
				SuperSprite.call( this, x, y, pg );
				return this;
			},
			// アイテムやバレット（自機、敵機）が敵機や自機に衝突した時の処理	
			hitEntity: function( self, arr, pg, callback ) {
				// 衝突判定
				for ( var i in arr ) {
					if ( self.intersect( arr[ i ] ) ) {
						// モノは確実に削除する
						this.pg.removeChild( self );
						// コールバック
						if ( callback ) callback( arr, i, pg );
					}
				}
			}
		} );

		// #################################################################################
		//    球クラス(球の衝突や)
		// #################################################################################
		var Bullet = Class.create( Things, {
			initialize: function( x, y, pg ) {
				Things.call( this, x, y, pg );
				return this;
			}
		} );

		// ###########################
		//    実機弾子クラス
		// ###########################
		var PlayerBullet = Class.create(Bullet, {
			initialize: function( x, y, pg ) {
				Bullet.call( this, 16, 16, pg );
				this.setPosition( setting.playerWidth + x, setting.playerHeight / 4 + y );
				this.setImage( files.bullet );
				this.setFrame( [ 50 ] );
				this.bulletSound = game.assets[ files.hittedSound ].clone(); // 球の音
				this.addInstance( this );
				var self = this; // コンテキストの避難
				this.addEventListener( 'enterframe', function(){
					// 球の速度
					self.x += setting.playerBulletAgility;
					// ヒット処理
					self.hitEntity( self, enemyArr, pg, function( arr, i, pg ){
						// ボスと非ボスで処理を切り替える
						if ( arr[ i ].type == setting.enemyTypeThreeBody ||
							arr[ i ].type == setting.enemyTypeThreeHead ||
							arr[ i ].type == setting.enemyTypeThreeBodyRibon ||
							arr[ i ].type == setting.enemyTypeThreeHeadRibon) {
							self._hitBoss( arr, i, self, pg );
						} else { // 通常敵の時の処理
							self._hitEnemy( arr, i, self, pg );
						}
					} );
					// 画面外に出る処理
					self.getOut( self, null );
				} );
				return this;
			},
			// 普通の敵に当たった時の処理
			_hitEnemy: function( arr, i, self, pg ) {
				// 爆発しろ
				new Explosion(
					self.x,
					self.y,
					pg
				);
				// サウンド再生
				if ( store.music ) this.bulletSound.play();
				// 当たった敵の体力をデクリメント
				arr[ i ].hitpoint--;
			},
			// ボスに当たった時の処理
			_hitBoss: function( arr, i, self, pg ) {
				// リボンのはかいフェーズ
				if ( store.MajiFlag == false ) {
					if ( arr[ i ].type == setting.enemyTypeThreeHeadRibon ) {
						// 爆発しろ
						new Explosion(
							self.x,
							self.y,
							pg
						);
						// サウンド再生
						if ( store.music ) this.bulletSound.play();
						// 当たった敵の体力をデクリメント
						arr[ i ].hitpoint--;
					// 体破壊フェーズ
					} else {
						// 別エフェクト(体力減算なし)
						new Cure(
							self.x,
							self.y,
							pg
						);
					}
				// 本気モード
				} else {
					new Explosion(
						self.x,
						self.y,
						pg
					);
					// 当たった敵の体力をデクリメント
					arr[ i ].hitpoint--;
					// サウンド再生
					if ( store.music ) this.bulletSound.play();
				}
			}
		} );

		// ###########################
		//    敵機玉子クラス
		// ###########################
		var EnemyBullet = Class.create( Bullet, {
			initialize: function( x, y, pg ) {
				Bullet.call( this, 16, 16, pg );
				this.setPosition( setting.playerWidth + x, setting.playerHeight / 2 + y );
				this.setImage( files.bullet );
				this.setFrame( [ 62 ] );
				this.addInstance( this );
				this.hitSound = game.assets[ files.enemyCrashed ].clone(); // 敵の爆破音
				var self = this;
				this.addEventListener( 'enterframe', function(){
					// 球の発射速度
					self.x -= setting.playerBulletAgility;
					// 自機とのヒット処理
					self.hitEntity( self, playerArr, pg, function( arr, i, pg ){
						// 回復オプションの変更(上限を超えない範囲で)
						new Explosion(
							self.x,
							self.y,
							pg
						);
						// 体力減算
						if ( !( store.playerHitpoint <= 0 ) ) store.playerHitpoint -= setting.enemyPower;
						// 音楽
						if ( store.music ) self.hitSound.play();
					} );
					// 画面外に出る処理
					self.getOut( self, null );
				} );
				return this;
			}
		} );


		// ###########################
		//    敵機玉子クラス
		// ###########################
		var EnemyBullet2 = Class.create( Bullet, {
			initialize: function( x, y, pg ) {
				Bullet.call( this, 16, 16, pg );
				this.setPosition( setting.playerWidth + x, setting.playerHeight / 2 + y );
				this.setImage( files.bullet );
				this.setFrame( [ 62 ] );
				this.addInstance( this );
				var self = this;
				this.addEventListener( 'enterframe', function(){
					// 球の発射速度
					self.x -= setting.playerBulletAgility;
					// 自機とのヒット処理
					self.hitEntity( self, playerArr, pg, function( arr, i, pg ){
						// Note: 自機の画像も自機の配列の要素も削除しない
						// 回復オプションの変更(上限を超えない範囲で)
						new Explosion(
							self.x,
							self.y,
							pg
						);
						// 体力減算
						if ( !( store.playerHitpoint <= 0 ) ) store.playerHitpoint -= setting.enemyPower;
					} );
					// 画面外に出る処理
					self.getOut( self, null );
				} );
				return this;
			}
		} );

		// ###########################
		//    ボスバレット1
		// ###########################
		var BossBullet1 = Class.create( Bullet, {
			initialize: function( x, y, pg, angle ) {
				Bullet.call( this, 16, 16, pg );
				this.setPosition( setting.playerWidth + x, setting.playerHeight / 2 + y );
				this.setImage( files.bullet );
				this.setFrame( [ 62 ] );
				this.addInstance( this );
				this.hitSound = game.assets[ files.enemyCrashed ].clone(); // 敵の爆破音
				var self = this;
				this.addEventListener( 'enterframe', function(){
					// 球の発射速度
					self.x -= 10;
					self.y -= angle;
					// 自機とのヒット処理
					self.hitEntity( self, playerArr, pg, function( arr, i, pg ){
						// 爆発
						new Explosion(
							self.x,
							self.y,
							pg
						);
						// 音楽
						if ( store.music ) self.hitSound.play();
						// 体力減算
						if ( !( store.playerHitpoint <= 0 ) ) store.playerHitpoint -= setting.enemyPower;
					} );
					// 画面外に出る処理
					self.getOut( self, null );
				} );
				return this;
			}
		} );

		// ###########################
		//     ボスバレット2
		// ###########################
		var BossBullet2 = Class.create( Bullet, {
			initialize: function( x, y, pg, xangle, yangle ) {
				Bullet.call( this, 16, 16, pg );
				this.setPosition( setting.playerWidth + x, setting.playerHeight / 2 + y );
				this.setImage( files.bullet );
				this.setFrame( [ 62 ] );
				this.addInstance( this );
				this.hitSound = game.assets[ files.enemyCrashed ].clone(); // 敵の爆破音
				var self = this;
				this.addEventListener( 'enterframe', function(){
					// 定数
					var const1 = Math.floor( Math.random() * ( 3 - 1 ) + 1 );
					self.x -= xangle * const1 * 2; // 横の速さは縦の二倍とする
					self.y -= yangle * const1; 
					// 自機とのヒット処理
					self.hitEntity( self, playerArr, pg, function( arr, i, pg ){
						// 爆発
						new Explosion(
							self.x,
							self.y,
							pg
						);
						// 音楽
						if ( store.music ) self.hitSound.play();
						// 体力減算
						if ( !( store.playerHitpoint <= 0 ) ) store.playerHitpoint -= setting.enemyPower;
					} );
					// 画面外に出る処理
					self.getOut( self, null );
				} );
				return this;
			}
		} );

		// #################################################################################
		//     アイテムクラス
		// #################################################################################
		var Item = Class.create( Things, {
			// コンストラクタ
			initialize: function( x, y, pg ) {
				Things.call( this, x, y, pg ); // 最初の位置
				this.setImage( files.bullet );
				// アイテムゲット時の音楽
				this.sound = game.assets[ files.getItem ].clone();
				var self = this;
				this.addEventListener( 'enterframe' , function(){
					// アイテムの速度
					self.x -= setting.itemAgility;
					// 画面外に出る処理
					self.getOut( self, null );
				} );
				return this;
			}
		} );

		// ###########################
		//   回復アイテム
		// ###########################
		var RecoveryItem = Class.create( Item, {
			// コンストラクタ
			initialize: function( x, y, pg ) {
				Item.call( this, 16, 16, pg ); // 最初の位置
				this.setPosition( x, y ); // ポジションを変える
				this.setImage( files.bullet );
				this.setFrame( [ 10 ] ); // 回復アイテム
				this.addInstance( this );
				var self = this; // コンテキストの避難
				this.addEventListener( 'enterframe', function(){
					// ヒット処理
					self.hitEntity( self, playerArr, pg, function( arr, i, pg ){
						// 回復演出
						new Cure(
							self.x,
							self.y,
							pg
						);
						// 回復音
						if ( store.music ) self.sound.play();
						// 回復オプションの変更(上限を超えない範囲で)
						if ( store.playerHitpoint < setting.maxPlayerHitpoint ) {
							store.playerHitpoint++;
						}
					} );
				} );
				return this;
			}
		} );

		// ###########################
		//   速度アイテム
		// ###########################
		var SpeedItem = Class.create( Item, {
			// コンストラクタ
			initialize: function( x, y, pg ) {
				Item.call( this, 16, 16, pg ); // 最初の位置
				this.setPosition( x, y ); // ポジションを変える
				this.setImage( files.bullet );
				this.setFrame( [ 13 ] ); // 回復アイテム
				this.addInstance( this );
				var self = this;
				this.addEventListener( 'enterframe' , function(){
					// ヒット処理
					self.hitEntity( self, playerArr, pg, function( arr, i, pg ){
						// 回復処理
						new Cure(
							self.x,
							self.y,
							pg
						);
						if ( store.music ) self.sound.play();
						// 速度オプションの変更(上限を超えない範囲で)
						if ( store.playerAgility < setting.maxPlayerAgility ) {
							store.playerAgility += 5;
						}
					} );
				} );
				return this;
			}
		} );

		// ###########################
		//    爆発演出クラス
		// ###########################
		var Explosion = Class.create( SuperSprite, {
			// コンストラクタ2
			initialize: function( x, y, pg ){
				SuperSprite.call( this, 16, 16, pg );
				this.setPosition( x, y ); // ポジションを変える
				this.setImage( files.explosion );
				this.setFrame( [ 1, 2, 3, 4, 5 ] );
				this.addInstance( this );
				var self = this;
				this.addEventListener( 'enterframe', function() {
					// 爆発フレームが5になったら爆発フレームの削除をする
					if ( self.frame == 5 ) {
						self.removeInstance( self );
					}
				} );

				return this;
			}
		} );

		// ###########################
		//    回復演出クラス
		// ###########################
		var Cure = Class.create( SuperSprite, {
			// コンストラクタ
			initialize: function( x, y, pg ){
				SuperSprite.call( this, 16, 16, pg );
				this.setPosition( x, y ); // ポジションを変える
				this.setImage( files.cure );
				this.setFrame( [ 1, 2, 3, 4 ] );
				this.addInstance( this );
				var self = this;
				this.addEventListener( 'enterframe' , function() {
					// 爆発フレームが5になったら爆発フレームの削除をする
					if ( self.frame == 4 ) {
						self.removeInstance( self );
					}
				} );
				return this;
			}
		} );

		// エクスポート
		return {
			// 機体
			Aircraft           	: Aircraft,
			Player             	: Player,
			Enemy              	: Enemy,
			ZakoEnemy          	: ZakoEnemy,
			ZakoEnemy2         	: ZakoEnemy2,
			BossEnemy          	: BossEnemy,
			BossEnemyHead      	: BossEnemyHead,
			BossEnemyBody      	: BossEnemyBody,
			BossEnemyHeadRibbon	: BossEnemyHeadRibbon,
			BossEnemyBodyRibbon	: BossEnemyBodyRibbon,
			Things             	: Things,
			Bullet             	: Bullet,
			PlayerBullet       	: PlayerBullet,
			EnemyBullet        	: EnemyBullet,
			EnemyBullet2       	: EnemyBullet2,
			BossBullet1        	: BossBullet1,
			BossBullet2        	: BossBullet2,
			Item               	: Item,
			RecoveryItem       	: RecoveryItem,
			SpeedItem          	: SpeedItem,
			Explosion          	: Explosion,
			Cure               	: Cure
		};
	};

} )();