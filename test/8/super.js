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

	// ###########################
	//    スーパースプライトクラス
	// ###########################
	var SuperSprite = Class.create(Sprite, {
		// コンストラクタ
		initialize: function(x, y, me){ // meはPlayGameインスタンスを指す
			//console.log('スーパークラスの継承');
			Sprite.call(this, x, y);
			this.game = me;
			return this;  
		},
		// 機体の追加処理
		addInstance: function(self) {
			//console.log('インスタンスの追加');
			this.game.addChild(self);
			return this;
		},
		// 機体の削除処理
		removeInstance: function(self) {
			//console.log('インスタンスの削除')
			this.game.removeChild(self);
			// 配列のdelete処理
			return this;
		},
		// ###############
		//   ラッパーメソッド
		// ###############
		// キャラクターポジション
		setPosition: function(x, y) {
			//console.log('キャラクターの位置替え');
			this.x = x;
			this.y = y;
			return this;
		},
		// フレーム(アニメ)のセット
		setFrame: function(arr) {
			//console.log('フレームのセット');
			this.frame = arr;
			return this;
		},
		// 画像のセット
		setImage: function(imgSrc) {
			//console.log('画像切り替え');
			this.image = game.assets[imgSrc];
			return this;
		},
		// 画面外に出たら削除するメソッド(ストアの配列とインスタンスの削除)
		// プレイヤーバレットの時は、arrなし
		getOut: function(self, arr) {
			if (self.x > setting.gameWidth ||
				self.x < 0) { // エンティティの位置がgameの幅を超えたら
				if (this._isArray(arr)) { // 配列の確認、プレイヤーは配列がないため
					self.removeInstance(self);
					console.log('自機か敵機かアイテムが画面外に出ました');
					console.log ( !!(　delete arr[self.uuid]) );
				} else {
					console.log('球が外に出ました');
					self.removeInstance(self);
				}
			}
		},
		// 配列か確認プライベートメソッド
		_isArray: function(value) {
			return value &&                             
				typeof value === 'object' &&
				typeof value.length === 'number' &&
				typeof value.splice === 'function' &&
				!(value.propertyIsEnumerable('length'));
		}
	});

	// エクスポート
	window.super = {
		SuperLabel: SuperLabel,
		SuperSprite: SuperSprite
	};


});