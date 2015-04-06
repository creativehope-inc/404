// おまじない
enchant();

window.onload = function(){

	var game = new Core(400, 400);
	game.fps = 30;
	game.preload('chara1.png', 'chara2.png', 'icon0.png', 'bigmonster1.gif');
	game.onload = function() {

		// ゲームの設定
		game.keybind(32, 'space');

		/* #################################
		 *  動くクマのテスト
		 * #################################
		 */
		var bear5 = new Sprite(32, 32);
		bear5.image = game.assets['chara2.png'];
		bear5.x = bear5.y = 250;　// 初期位置
		bear5.addEventListener('enterframe', function(e){ //イベントリスナーを追加する		 	
		 	//enterframeイベントのイベントリスナー
		  	// 移動処理、キャラクター分減らす
		  	this.frame = [1,2,3];
			if (game.input.left && this.x >0) {
				this.x -= 3;
				this.frame = 2;
			}
			if (game.input.right && this.x <400 - 32) {
				this.x += 3;
				this.frame = 1;
			}
			if (game.input.up && this.y >0) {
				this.y -= 3;
			}
			if (game.input.down && this.y <400 - 32) {
				this.y += 3;
			}
			if (game.input.left == false && game.input.right == false)  {
				this.frame +=1;
			}

			// 発射
			if (game.input.space && game.frame % 3 == 0) {
				// ミサイル
				var bullet = new Sprite(16, 16);
				bullet.image = game.assets['icon0.png'];
				bullet.frame = [54, 62];
				bullet.x = bear5.x + 30;
				bullet.y = bear5.y + 32/2;
				second.addChild(bullet);
				bullet.addEventListener('enterframe', function(){
					this.x += 10;
					// 衝突判定
					if (this.within(enemy, enemy.width/2)) {
						console.log('球があたる');
						second.removeChild(bullet);
						enemy.frame = [7];
					} else {
						enemy.frame= [6];
					}
					if (this.x > 360) {
						second.removeChild(this);
					}
				});
			}
		});

		/* #################################
		 *  敵のテスト
		 * #################################
		 */
		var enemy = new Sprite(80,80);
		enemy.image = game.assets['bigmonster1.gif'];
		enemy.frame = [6];
		enemy.x = enemy.y = 150;　// 初期位置
		enemy.addEventListener('enterframe', function(e){ //イベントリスナーを追加する
			// intersect 
			if (this.within(bear5, bear5.width/2)) {
				console.log('ヒットしました');
				game.pushScene(gameOverScene);
				game.stop();
			}
			// within

		});

			// ハローメッセージ
			var helloMessage = new Label('ゲームスタート');
			helloMessage.x = helloMessage.y = 40;
			helloMessage.color = 'white';
			helloMessage.font = '50px'

			// ラベルのテスト(得点)
			var log = new Label('Hello World');
			log.x = log.y = 10;
			log.color ='red';
			log.font = '14px "Arial"';
			log.addEventListener('enterframe', function(){
				log.text = (game.frame / game.fps).toFixed(2);
			});

			// ゲームオーバーのメッセージ
			var gameOverMessage = new Label('ゲームオーバー');
			gameOverMessage.x = gameOverMessage.y = 50;
			gameOverMessage.font = '40px';
			gameOverMessage.color = "white";

		// セカンドsceneの作成
		var second = new Scene();
		second.backgroundColor = 'pink';

		// サードsceneの作成
		var third = new Scene();
		third.backgroundColor = 'blue';

		// ゲームオーバーscene
		var gameOverScene = new Scene();
		gameOverScene.backgroundColor = 'black';


		// #####################
		//    ゲームのルートscene
		// #####################
		game.rootScene.backgroundColor = '#777777' // 背景色
		game.rootScene.addEventListener('touchstart', function() {
			game.pushScene(second);
		});
		game.rootScene.addChild(helloMessage); // 最初の文字列をつかする

		// ###################
		//    セカンドsceneをタッチしたら切り替え
		// ###################
		second.addChild(bear5); // クマを出現させる
		second.addChild(log); // ルートsceneにメッセージを表示
		second.addChild(enemy); // 敵キャラを出現する	
		second.addEventListener('touchstart', function() {
			game.pushScene(gameOverScene);
		});

		gameOverScene.addChild(gameOverMessage);
		gameOverScene.addEventListener('touchstart', function() {
			game.pushScene(game.rootScene);
		})


	};
	game.start();
};

/*

	参考文献
	http://www.slideshare.net/sidestepism/5-tlenchantjs

*/