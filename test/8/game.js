 $(document).ready(function(){

	// 選択肢
	var options;

	// ゲーム設定用のオブジェクト
	var setting = {
		debug: false,
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
	};

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

	// エクスポート
	window.game = {
		game: game,
		setting: setting,
		image: image,
		store: store,
		playerArr: playerArr,
		enemyArr: enemyArr,
		itemArr: itemArr
	};

});