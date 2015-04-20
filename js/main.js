$( function(){

	var gamer		= define();
	var superClass  = base( gamer );
	var klass       = sub( gamer, superClass );
	// #################################################
	//                     インポート
	// #################################################

	// ゲームの設定など
	var game      = gamer.game,
		setting   = gamer.setting,
		files     = gamer.files,
		store     = gamer.store,
		playerArr = gamer.playerArr,
		enemyArr  = gamer.enemyArr,
		itemArr   = gamer.itemArr;

	// スーパーの設定
	var SuperLabel 	               	= superClass.SuperLabel,
	    SuperSprite	               	= superClass.SuperSprite,
	               	SuperBackground	= superClass.SuperBackground,
	               	SuperScene     	= superClass.SuperScene,
	               	SuperImage     	= superClass.SuperImage,
	               	SuperEntity    	= superClass.SuperEntity,
	               	SuperRootScene 	= superClass.SuperRootScene;

	// サブクラスの設定
	var Aircraft			= klass.Aircraft,
		Player              = klass.Player,
		Enemy	            = klass.Enemy,
		ZakoEnemy           = klass.ZakoEnemy,
		ZakoEnemy2          = klass.ZakoEnemy2,
		BossEnemyHead       = klass.BossEnemyHead,
		BossEnemyBody       = klass.BossEnemyBody,
		BossEnemyHeadRibbon = klass.BossEnemyHeadRibbon,
		BossEnemyBodyRibbon = klass.BossEnemyBodyRibbon,
		Things      		= klass.Things,
		Bullet      		= klass.Bullet,
		PlayerBullet		= klass.PlayerBullet,
		EnemyBullet 		= klass.EnemyBullet,
		EnemyBullet2		= klass.EnemyBullet2,
		Item        		= klass.Item,
		RecoveryItem		= klass.RecoveryItem,
		SpeedItem   		= klass.SpeedItem,
		Explosion   		= klass.Explosion,
		Cure        		= klass.Cure;

	// ####################
	//   メイン関数
	// ####################
	var main  = function() {

		// 音楽データの保存
		var sound = game.assets[ files.mainSound ].clone();
		// Note: 全てのIEでエラーが出るので原因はわからないが終了する
		//sound.src.loop = true;
		sound.preMusic = store.music; // 過去のデータを保存する

		// ########################################################
		//                シーンの設定
		// ########################################################
		// ゲームに関する
		// 全ての管理処理をルートsceneで行う(シーンに依存しない)
		new SuperRootScene(
			game,
			[ // 以下addchild要素
				new SuperBackground(
					setting.gameWidth,
					setting.gameHeight,
					files.title,
					null,
					null
				),
				new SuperImage(
					291,
					55,
					340,
					420,
					null,
					files.startButton,
					function() { // タッチ処理
						// ゲームスタート
						store.currentScene = 'gamestart';
					},
					null,
					null
				),
				new SuperImage(
					87,
					32/2,
					830,
					10,
					( store.music ) ? this.frame = [2] : this.frame = [1],
					files.soundButton,
					function() { // タッチ処理
						( store.music ) ? store.music = false : store.music = true;
					},
					function() { // フレーム処理
						// 音楽の切り替え
						( store.music ) ? this.frame = [2] : this.frame = [1];
					},
					null
				)
			],
			// エンターフレーム処理
			function() {
				// 音楽の切り替え処理
				if ( sound.preMusic != store.music ) {
					( store.music ) ? sound.play() : sound.pause();
					sound.preMusic = store.music;
				}
				// カレントシーンの判断
				if ( store.currentScene == 'gamestart' ) {
					// 開始
					game.pushScene( playGameFn() );
				}
				// スペースでリトライ機能
				if ( game.input.space ) {
					store.currentScene = 'gamestart';
				}
			}
		);

		// ########################################################
		//            プレイゲーム
		// ########################################################
		var playGameFn = function() {

			// 初期化処理
			store.startTime           	= ( game.frame / game.fps ).toFixed ( 2 ) ;
			store.playerHitpoint      	= setting.playerHitpoint;
			store.playerAgility       	= setting.playerAgility;
			store.gamePoint           	= 0;
			store.gameTime            	= 0;
			store.MajiFlag            	= false;
			store.zakoEnemyCounter    	= 0;
			store.zakoEnemy2Counter   	= 0;
			store.bossHeadCounter     	= 0;
			store.bossHeadRibonCounter	= 0;
			store.bossBodyCounter     	= 0;
			store.bossBodyRibonCounter	= 0;

			// フラグ
			var bossFlag = 1; // ボス出現フラグ
			var submit = {
				flag : false, // 送信フラグ
				results: false
			}

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
							if ( this.x <= - setting.gameWidth ) {
								this.x = setting.gameWidth - 10; // 間が空くのでちょっと詰める
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
							if ( this.x <= -setting.gameWidth ) {
								this.x = setting.gameWidth - 10; // 間が空くのでちょっと詰める
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
						'#e84b5f',
						setting.labelFontSize,
						null,
						function() {
							// ゲームタイムを保存
							store.gameTime = ( ( game.frame / game.fps ) - store.startTime ).toFixed( 2 );
							this.text = 'Time: ' + ( 120 - store.gameTime );
						}
					),
					new SuperLabel( // ヒットポイント
						150,
						10,
						null,
						null,
						'#ffea00',
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
						'#d1e3ff',
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
						'#fff',
						setting.labelFontSize,
						null,
						function() {
							this.text = 'Score: ' + store.gamePoint;
						}
					),
					new SuperImage(
						87,
						32/2,
						830,
						10,
						( store.music ) ? this.frame = [2] : this.frame = [1],
						files.soundButton,
						function() { // タッチ処理
							( store.music ) ? store.music = false : store.music = true;
						},
						function() { // フレーム処理
							// 音楽の切り替え
							( store.music ) ? this.frame = [2] : this.frame = [1];
						},
						null
					)
				],
				// フレーム処理
				function() {

					// 割り込みBGM専用処理
					if ( sound.preMusic != store.music ) {
						( store.music ) ? sound.play() : sound.pause();
						sound.preMusic = store.music;
					}

					// 敵小用
					if ( store.gameTime > 1 && store.gameTime < 30 ) {
						// 敵を出現させる(zako敵)
						if ( game.frame % 15 == 0 ) {
							new ZakoEnemy(
								setting.gameWidth - Math.floor( Math.random() * ( 30 - 20 ) + 20 ),
								Math.floor( Math.random() * ( setting.gameHeight - 0 ) + 0 ),
								game.frame + Math.floor( Math.random() *( 10000 - 0 ) + 0 ), //UUID
								playGame
							).saveStore( enemyArr ); // 敵の保存処理
						}
						// 回復アイテムを出現
						if ( game.frame % 100 == 0 ) {
							// 回復アイテムの出現
							new RecoveryItem(
								setting.gameWidth - 30,
								Math.floor( Math.random() * ( setting.gameHeight - 0 ) + 0 ),
								playGame
							);
						}
						// 速度アップアイテムを出現させる
						if ( game.frame % 120 == 0 ) {
							// 速度アップアイテム
							new SpeedItem(
								setting.gameWidth - 30,
								Math.floor( Math.random() * ( setting.gameHeight - 0 ) + 0 ),
								playGame
							);
						}
					}

					// 敵中用
					if ( store.gameTime > 5 && store.gameTime < 30 ) {
						// 敵を出現させる(zako敵)
						if ( game.frame % 25 == 0 ) {
							new ZakoEnemy2(
								setting.gameWidth - Math.floor( Math.random() * ( 30 - 20 ) + 20 ),
								Math.floor( Math.random() * ( setting.gameHeight - 0 ) + 0 ),
								game.frame,
								playGame
							).saveStore( enemyArr ); // 敵の保存処理
						}
					}
					
					// 敵ボス表示
					if ( store.gameTime >= 30 && store.gameTime < 120 && bossFlag == 1 ) {
						// ボスの体
						new BossEnemyBody(
							500,
							220,
							game.frame + Math.floor( Math.random() * ( 10000 - 0 ) + 0 ),
							playGame
						).saveStore( enemyArr ); // 敵の保存処理
						// ボスの頭
						new BossEnemyHead(
							515,
							150,
							game.frame + Math.floor( Math.random() *( 10000 - 0 ) + 0 ),
							playGame
						).saveStore( enemyArr ); // 敵の保存処理
						// ボスの頭のリボン
						new BossEnemyHeadRibbon(
							515,
							120,
							game.frame + Math.floor( Math.random() * ( 10000 - 0 ) + 0 ),
							playGame
						).saveStore( enemyArr ); // 敵の保存処理
						// ボスの体のリボン
						new BossEnemyBodyRibbon(
							540,
							240,
							game.frame + Math.floor( Math.random() * ( 10000 - 0 ) + 0 ),
							playGame
						).saveStore( enemyArr ); // 敵の保存処理
						bossFlag = 0;
					}

					// 時間アウト
					if ( store.gameTime > 120 ) {
						// ゲームオーバーscenes
						store.currentScene = 'gameover';
					}

					// 勝利モード
					if ( store.bossHeadCounter == 1 &&
						store.bossHeadRibonCounter == 1 &&
						store.bossBodyCounter == 1 &&
						store.bossBodyRibonCounter == 1 ) {

						store.currentScene = 'gameclear';

					}

					// ゲームオーバー処理
					if ( store.currentScene == 'gameover' ||
						store.currentScene == 'gameclear' ) {

						// ゲームオーバーscene
						if ( store.music ) sound.stop();
						var gameOverSound = game.assets[ files.gameOverSound ].clone();
						if ( store.music ) gameOverSound.play();

						// ゲームオーバーscene
						var gameOver = new SuperScene(
							setting.gameWidth,
							setting.gameHeight,
							( store.currentScene == 'gameover' ) ? 'black' : 'white', // 勝った場合は金色
							[
								new SuperLabel(
									360,
									100,
									500,
									500,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'40px cursive new',
									( store.currentScene == 'gameover' ) ? 'GAME OVER': 'GAME CLEAR', // 文言変更
									null
								),
								// 撃破数
								new SuperLabel(
									215,
									200,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'25px cursive new',
									'',
									null,
									null,
									function() {
										this.text += store.zakoEnemyCounter + '体';
									}
								),
								new SuperLabel(
									215,
									250,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'25px cursive new',
									'',
									null,
									null,
									function() {
										this.text += store.zakoEnemy2Counter + '体';
									}
								),
								new SuperLabel(
									215,
									300,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'25px cursive new',
									'',
									null,
									null,
									function() {
										this.text += store.bossHeadRibonCounter + '体 <br>';
									}
								),
								new SuperLabel(
									215,
									350,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'25px cursive new',
									'',
									null,
									null,
									function() {
										this.text += store.bossBodyRibonCounter + '体';
									}
								),
								new SuperLabel(
									385,
									200,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'25px cursive new',
									'',
									null,
									null,
									function() {
										this.text += store.bossHeadCounter + '体<br>';
									}
								),
								new SuperLabel(
									385,
									270,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'25px cursive new',
									'',
									null,
									null,
									function() {
										this.text += store.bossBodyCounter + '体<br>';
									}
								),
								new SuperLabel(
									200,
									430,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'35px cursive new',
									'',
									null,
									null,
									function() {
										this.text = 'Score: ' + store.gamePoint + ' pt.';
									}
								),
								// 送信ボタン
								new SuperImage(
									98,
									32,
									680,
									305,
									null,
									files.submitButton,
									function() { // タッチ処理

										if ( !submit.flag ) {
											// 送信処理
											var userName = $( '#textBox' ).val();
											this.text = '送信中です';
											if ( !userName ) return this.text = '名前を入力してください';

											// 返信確認
											window.callbacker  = function( data ) {
												submit.results = data;
												submit.flag = true;
											}
											var solt = ( typeof window.__404_picomon_solt__ === 'function' ) ? __404_picomon_solt__() : '';
											var js2 = document.createElement( 'script' );
											js2.src = 'https://www.picomon.jp/game/set_score?data=' + Base64.encodeURI( solt + Base64.encodeURI( JSON.stringify( {
												callback: 'callbacker',
												type:      'shooting_code_404',
												score:    ( store.gamePoint == 0 ) ? 1 : store.gamePoint, // <--- 0ポイントだとエラーなのでバリでする
												nickname: encodeURIComponent( userName )
											} ) ) );
											var fjs2 = document.getElementsByTagName( 'script' )[ 0 ];
											fjs2.parentNode.insertBefore( js2, fjs2 );

											// 送信確認処理
											var self = this;
											js2.onload = function () {
											fjs2.parentNode.removeChild( js2 );
											if ( submit.results.error == 0 ) {
													self.text = '送信が完了しました<br>因みに' + submit.results.rank + '位です。';	
												} else {
													self.text = '送信に失敗しました<br>' + 'Error Code:' + submit.results.err_msg;
												}
												submit.flag = true;
											};
										}
									},
									function() {
										// 送信ボタンが押されたら削除
										if (submit.flag) gameOver.removeChild(this);
									},
									null
								),
								// 説明文字
								new SuperLabel(
									530,
									210,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'18px cursive new',
									'',
									null,
									null,
									function() {
										this.text = '名前を入力して送信ボタンを押すと<br>';
										this.text += 'ランキングに登録することができます';
									}
								),
								// テキストボックス後の通知のインスタンス
								new SuperLabel(
									580,
									300,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'18px cursive new',
									' ',
									function() {
										// 送信ボタンが押されたら削除
										if ( submit.flag ) {
											if ( submit.results.error == 0 ) {
													this.text = '送信が完了しました<br>因みに' + submit.results.rank + '位です。';
											} else {
												this.text = '送信に失敗しました<br>' + 'Error Code:' + submit.results.err_msg;
											}
										}
									},
									null,
									null
								),
								// テキストボックスのインスタンス
								new SuperEntity (
									120,
									30,
									530,
									305,
									document.createElement( 'input' ),
									'text',
									'text',
									'textBox',
									function() {
										// 送信ボタンが押されたら削除
										if (submit.flag) gameOver.removeChild(this);
									}
								),
								// 継続ボタン
								new SuperLabel(
									390,
									520,
									300,
									100,
									( store.currentScene == 'gameover' ) ? 'white' : 'black',
									'40px cursive new',
									'Continue?',
									null,
									function() {
										game.popScene( playGame );
										game.popScene( gameOver );
										store.currentScene = '';
										if ( store.music ) sound.play();
									}
								),
								// SNSボタン
								new SuperImage(
									32,
									32,
									570,
									400,
									null,
									files.twitter,
									function() { // タッチ処理
										// ツイッターのウィンドウを表示
										window.open( 'https://twitter.com/intent/tweet?text=' +
											encodeURIComponent( 'ピコもん 404ゲームで' ) + store.gamePoint + encodeURIComponent( 'スコアを獲得した！ ' ) + (location.href) +
											'&url=' + '&original_referer=' +  
											'&hashtags=' + encodeURIComponent( '404ゲーム' ) + '&related=code1616',
											'twitter-share-dialog',
											'width=626,height=436' );
									},
									null,
									null
								),
								new SuperImage(
									32,
									32,
									630,
									400,
									null,
									files.facebook,
									function() { // タッチ処理
										// フェイスブックのウィンドウを表示
										window.open( 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent( location.href ),
										'facebook-share-dialog',
										'width=626,height=436' );
									},
									null,
									null
								),
								new SuperImage(
									32,
									32,
									690,
									400,
									null,
									files.ranking,
									function() { // タッチ処理
										// ランキングのウィンドウを表示
										// 送信処理
										window.open( 'http://battamon.net:8080/kaneko_game/404/popup.html' ,
										'ranking-dialog',
										'width=313,height=400' );
									},
									null,
									null
								),
								new SuperImage(
									87,
									32/2,
									830,
									10,
									( store.music ) ? this.frame = [2] : this.frame = [1],
									files.soundButton,
									function() { // タッチ処理
										( store.music ) ? store.music = false : store.music = true;
									},
									function() { // フレーム処理
										// 音楽の切り替え
										( store.music ) ? this.frame = [2] : this.frame = [1];
									},
									null
								),
								// シューター1
								new SuperImage(
									32,
									32,
									170,
									200,
									[4],
									files.shooter,
									null,
									null,
									null
								),
								// シューター2
								new SuperImage(
									32,
									32,
									170,
									250,
									[6],
									files.shooter,
									null,
									null,
									null
								),
								// 頭リボン
								new SuperImage(
									78,
									56,
									150,
									290
									,
									null,
									files.head_r,
									null,
									null,
									function() { // ワンタイム処理
										this.scale(0.5, 0.5);
									}
								),
								// 体リボン
								new SuperImage(
									40,
									31,
									170,
									355,
									null,
									files.body_r,
									null,
									null,
									function() { // ワンタイム処理
										this.scale(0.5, 0.5);
									}
								),
								// 体
								new SuperImage(
									194,
									246,
									235,
									185,
									null,
									files.body,
									null,
									null,
									function() { // ワンタイム処理
										this.scale(0.5, 0.5);
									}
								),
								// 頭
								new SuperImage(
									144,
									166,
									255,
									160,
									null,
									files.head,
									null,
									null,
									function() { // ワンタイム処理
										this.scale(0.5, 0.5);
									}
								)
							],
							function() { // フレーム処理
								// スペースでリトライ機能
								if ( game.input.space ) {
									game.popScene( playGame );
									game.popScene( gameOver );
									store.currentScene = '';
									if ( store.music ) sound.play();
								}
							},
							null,
							function() {
								// TODO: SuperSceneクラスについかする
								this._element.style.opacity = 0.8;
							}
						);
						// ゲームオーバー
						game.pushScene( gameOver );
						// 色々初期化しよう
						for ( key in enemyArr ) {
							delete enemyArr[ key ];
						}
						for ( key in playerArr ) {
							delete playerArr[ key ];
						}
						for ( key in itemArr ) {
							delete itemArr[ key ];
						}
					}
				}
			);

			// プレイヤーインスタンスの作成
			var player = new Player(
				0,
				setting.gameHeight / 2,
				game.frame + Math.floor( Math.random() * ( 10000 - 0 ) + 0 ),
				playGame // game context
			);
			player.saveStore( playerArr ); // 出現データの保存
			
			// プレイゲームインスタンスを返す
			return playGame;
		};

	};

	// ####################
	//   ゲームの開始
	// ####################
	game.onload = main;
	game.start();

	// ####################
	//   非対応処理
	// ####################
	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();

	var ua = (function() {
		if (userAgent.indexOf('opr') != -1) {
		  return 'opera';
		} else if (userAgent.indexOf('msie') != -1) {
			// IEの場合は判定
			if (appVersion.indexOf("msie 6.") != -1) {
				return 'ie6';
			} else if (appVersion.indexOf("msie 7.") != -1) {
				return 'ie7';
			} else if (appVersion.indexOf("msie 8.") != -1) {
				return 'ie8';
			} else if (appVersion.indexOf("msie 9.") != -1) {
				return 'ie9';
			} else {
				return 'ie';
			}
		} else if (userAgent.indexOf('chrome') != -1) {
			return 'chrome';
		} else if (userAgent.indexOf('safari') != -1) {
			return 'safari';
		} else if (userAgent.indexOf('gecko') != -1) {
			return 'gecko';
		} else {
			return false;
		}
	}());

	// 要素の削除
	if (ua =='ie7' || ua == 'ie6' || ua == 'ie8' || ua == 'opera') {
		game.stop();
		$(function(){
			$("#enchant-stage").remove();
			$('.ie_alert').show().css("text-aline", 'center');
		});
	}


} );