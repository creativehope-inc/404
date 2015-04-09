// おまじない
enchant();

window.onload = function(){

	var game = new Core(400, 400);
	game.fps = 30;
	game.preload('chara1.png', 'chara2.png', 'icon0.png');
	game.onload = function() {
		
		// 相対位置くま１
		var bear = new Sprite(32, 32);
		bear.image = game.assets['chara1.png'];
		bear.x = bear.y = 0;　// 初期位置
		bear.frame = [0,1,2]; // アニメーション
		// クマのタイムライン
		bear.tl.fadeIn(30) // 30フレームでフェードイン
				.moveBy(200, 0, 30, enchant.Easing.QUAD_EASEINOUT) // (200,0 )に90フレームかけて相対位置でイージングで移動
				.scaleTo(-1, 1, 10) // 拡大縮小、x:-1で反転する、10フレームかけて行う
				.delay(40) //40 フレーム遅らせる
				.moveBy(-200, 0, 90)
				.scaleTo(1, 1, 10)
				.loop();

		//　絶対位置くま
		var bear1 = new Sprite(32, 32);
		bear1.image = game.assets['chara1.png'];
		bear1.x = bear1.y = 55;　// 初期位置
		bear1.frame = 4; // Stringの場合
		// クマのタイムライン
		bear1.tl.fadeIn(30) // 30フレームでフェードイン
				.moveTo(30, 0, 180, enchant.Easing.QUAD_EASEINOUT) // (200,0 )に90フレーデ絶対位置でイージングで移動
				.scaleTo(-2, 2, 10) // 
				.delay(40) //40 フレーム遅らせる
				.moveTo(100, 100, 90) // 絶対位置に移動 
				.scaleTo(2, 2, 10)
				.fadeOut(30)
				.then(function() {
					// キャラの削除
					game.rootScene.removeChild(bear1);
				});

		// cueのテスト
		var bear2 = new Sprite(32, 32);
		bear2.image = game.assets['chara1.png'];
		bear2.x = bear2.y = 100;　// 初期位置
		bear2.frame = 5; // Stringの場合
		// クマのタイムライン
		bear2.tl.cue({
			10: function() {
				console.log('こんにちわ');
			},
			100: function() {
				console.log('さよなら');
			}
		});

		// 一片に実行する(and()メソッドもある)
		var bear3 = new Sprite(32, 32);
		bear3.image = game.assets['chara1.png'];
		bear3.x = bear3.y = 150;　// 初期位置
		bear3.frame = 5; // Stringの場合
		// クマのタイムライン
		bear3.tl.tween({
					x: 100,
					y: 190,
					scaleX:2,
					scaleY: 3,
					time: 100
				})
				.moveBy(30, 30, 3)
				.moveBy(-30, -30, 3)
				.loop();

		// 一片にスキップテスト
		var bear4 = new Sprite(32, 32);
		bear4.image = game.assets['chara1.png'];
		bear4.x = bear4.y = 200;　// 初期位置
		bear4.frame = 3; // Stringの場合
		// クマのタイムライン
		bear4.tl.moveBy(30, 30, 30)
				.skip(10)
				.moveBy(-30, -30, 30)
				.rotateTo(180, 40, enchant.Easing.LINEAR)
				.moveBy(0, 200, 30, enchant.Easing.LINEAR);

		// クマの操作と画像差し替えと発射テスト
		var bear5 = new Sprite(32, 32);
		bear5.image = game.assets['chara2.png'];
		bear5.x = bear5.y = 250;　// 初期位置
		//bear5.scaleTo(-1, 0, 10); // ｘ軸で反転
		game.keybind(32, 'space');
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
				game.rootScene.addChild(bullet);
				bullet.addEventListener('enterframe', function(){
					this.x += 10;
					if (this.x > 360) {
						game.rootScene.removeChild(this);
					}
				});
			}
		});

		bear5.on('touchstart')

		// ゲームの実行
		game.rootScene.backgroundColor = '#000000' // 背景色
		game.rootScene.addChild(bear); // クマを出現させる
		game.rootScene.addChild(bear1); // クマを出現させる
		game.rootScene.addChild(bear2); // クマを出現させる
		game.rootScene.addChild(bear3); // クマを出現させる
		game.rootScene.addChild(bear4); // クマを出現させる
		game.rootScene.addChild(bear5); // クマを出現させる

	};
	game.start();

};

/*

	参考文献
	http://www.slideshare.net/sidestepism/5-tlenchantjs

*/