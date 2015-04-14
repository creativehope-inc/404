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

	// #####################################
	//        　   　ラベル
	// #####################################
		var SuperLabel = Class.create(Label, {
			// コンストラクタ
			initialize: function(x, y, width, height, color, font, text, callback) {
				Label.call(this, text); // 最初の位置
				// 一気にインスタンスプロパティのセット
				this.x = x;
				this.y = y;
				// Note: バグか分からないが、幅や高さを指定すると位置の指定ができなくなるので無効化(下２行)
				//this.width = width || 'auto';
				//this.height = height || 'auto';
				this.color = color;
				this.font = font;
				this.text = text || ''; // エラーが出る可能性があるので空文字を入れておく
				this.addEventListener('enterframe', function() {
					// イベントリスナーの処理はcallbackに保存する
					if (callback) callback();
				});
			}
		});

	// エクスポート
	window.super = {
		SuperLabel: SuperLabel
	};


});