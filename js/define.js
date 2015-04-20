var define = ( function(){

	return function () {

		// おまじない
		var js = document.createElement( 'script' );
		js.src = 'https://www.picomon.jp/game/get_solt.js';
		var fjs = document.getElementsByTagName( 'script' )[ 0 ];
		fjs.parentNode.insertBefore( js, fjs );

		// ゲーム設定用のオブジェクト
		var setting = {
			debug                           	: false,
			gameWidth                       	: 960, // ゲームの幅
			gameHeight                      	: 640, // ゲームの高さ
			bulletWidht                     	: 16, // 球の幅
			bulletHieht                     	: 16, // 球の高さ
			playerBulletAgility             	: 10, // プレイヤーの玉の速さ
			playerHitpoint                  	: 3, // プレイヤーの初期体力
			maxPlayerHitpoint               	: 10, // プレイヤーのMAX体力
			minPlayerHitpoint               	: 1, // プレイヤーの許容する最少HP
			playerAgility                   	: 5, // プレイヤーの初期素早さ
			maxPlayerAgility                	: 20, // プレイヤーの移動速度の上限
			enemyBulletAgility              	: 10, // 敵の玉の速さ
			enemyAgility                    	: 4, //	敵の速さ
			enemyPower                      	: 1, // 雑魚敵の力
			itemAgility                     	: 4, // アイテムの流れる速さ
			labelFontSize                   	: '20px cursive new, arial, sans-serif',
			playerWidth                     	: 32, // プレイヤーの幅
			playerHeight                    	: 32, // プレイヤーの高さ
			enemyTypeOne                    	: 1, // 敵のタイプにして、これをその敵を倒した時のポイントとする。
			enemyTypeTwo                    	: 2,
			enemyTypeThreeHead              	: 30,
			enemyTypeThreeHeadRibon         	: 40,
			enemyTypeThreeBody              	: 50,
			enemyTypeThreeBodyRibon         	: 60,
			enemyTypeOneHitpoint            	: 3, // 以下がHitpoint
			enemyTypeTwoHitpoint            	: 5,
			enemyTypeThreeHeadHitpoint      	: 100,
			enemyTypeThreeHeadRibbonHitpoint	: 50,
			enemyTypeThreeBodyHitpoint      	: 100,
			enemyTypeThreeBodyRibbonHitpoint	: 50
		};

		var dir = 'assets/';
		// ゲームの画像用ストア 
		var files = {
			background   	: dir + 'img/background1.png',
			test         	: dir + 'img/chara1.png',
			player       	: dir + 'img/chara2.png',
			bullet       	: dir + 'img/icon0.png',
			title        	: dir + 'img/background.png',
			battle       	: dir + 'img/battle.jpg',
			explosion    	: dir + 'img/effect0.png',
			cure         	: dir + 'img/heal_eff_thumb.png',
			shooter      	: dir + 'img/shooter_06.png',
			head         	: dir + 'img/kao.png',
			head_2       	: dir + 'img/mie_3.png',
			body         	: dir + 'img/body.png',
			body_r       	: dir + 'img/ribbon_2.png',
			head_r       	: dir + 'img/ribbon.png',
			twitter      	: dir + 'img/Twitter.png',
			facebook     	: dir + 'img/Facebook.png',
			ranking      	: dir + 'img/Ranking.png',
			startButton  	: dir + 'img/start.png',
			soundButton  	: dir + 'img/sound.png',
			mainSound    	: dir + 'sound/mp3/404game_main.mp3',
			hittedSound  	: dir + 'sound/mp3/404game_hitted.mp3',
			fired        	: dir + 'sound/mp3/404game_bullet_fire.mp3',
			enemyCrashed 	: dir + 'sound/mp3/404game_enemy_crash.mp3',
			getItem      	: dir + 'sound/mp3/404game_item.mp3',
			gameOverSound	: dir + 'sound/mp3/404game_gameover.mp3',
			bossEnter    	: dir + 'sound/mp3/404game_boss_enter.mp3',
			bossCrashed  	: dir + 'sound/mp3/404game_boss_crash.mp3',
			submitButton 	: dir + 'img/submit_button.png'
		};

		// 各種ポイントの保存庫
		var store = {
			playerHitpoint      	: '', // プレイヤーのヒットポイント
			playerAgility       	: '', // プレイヤーの速さ
			bossHitpoint        	: '', // ボスのヒットポイント
			gamePoint           	: '', // ゲームのポイント
			startTime           	: '', // ゲームの開始時刻
			gameTime            	: '', // ゲームの時間
			currentScene        	: '', // ゲームの現在のシーン
			MajiFlag            	: false, // 最終フラグ(ボスのリボン)
			music               	: false, // ミュージックフラグ
			zakoEnemyCounter    	: 0,
			zakoEnemy2Counter   	: 0,
			bossHeadCounter     	: 0,
			bossHeadRibonCounter	: 0,
			bossBodyCounter     	: 0,
			bossBodyRibonCounter	: 0
		};

		// ゲームの敵やアイテムのインスタンスの保存庫
		var playerArr	= [],
			enemyArr     	= [],
			itemArr      	= [];

		// おまじない
		enchant();

		// デバッグの無効化
		if ( setting.debug == true ) {
			var noop = function(){};
			console.log = noop;
		}

		// ゲーム
		var game = new Core( setting.gameWidth, setting.gameHeight );
		game.fps = 30;
		game.keybind( 32, 'space' );

		// プリリロード
		// TODO: プロパティ名に予約語が入っている
		game.preload(
			files.background,
			files.test,
			files.player,
			files.bullet,
			files.title,
			files.explosion,
			files.cure,
			files.shooter,
			files.head,
			files.head_2,
			files.body,
			files.body_r,
			files.head_r,
			files.mainSound,
			files.hittedSound,
			files.fired,
			files.enemyCrashed,
			files.getItem,
			files.gameOverSound,
			files.startButton,
			files.soundButton,
			files.bossEnter,
			files.bossCrashed,
			files.twitter,
			files.facebook,
			files.ranking,
			files.submitButton
		);
		
		// エクスポート
		return {
			game     	: game,
			setting  	: setting,
			files    	: files,
			store    	: store,
			playerArr	: playerArr,
			enemyArr 	: enemyArr,
			itemArr  	: itemArr,
		};
	};
} )();