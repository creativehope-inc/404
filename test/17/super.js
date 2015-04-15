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

	// #####################################
	//        　   　ラベル
	// #####################################
	var SuperLabel = Class.create(Label, {
		// コンストラクタ
		initialize: function(x, y, width, height, color, font, text, efFn, toFn, otFn) {
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
			var self = this;
			this.addEventListener('enterframe', function() {
				// イベントリスナーの処理はcallbackに保存する
				if (efFn) efFn.call(self);
			});
			// タッチ時の関数
			this.addEventListener('touchstart', function(){
				if (toFn) toFn.call(self);
			});
			// ワンタイム処理
			if (otFn) otFn.call(self);
		}
	});

	// ###########################
	//    スーパースプライトクラス
	// ###########################
	var SuperSprite = Class.create(Sprite, {
		// コンストラクタ
		initialize: function(x, y, pg){ // meはPlayGameインスタンスを指す
			Sprite.call(this, x, y);
			this.pg = pg;
			return this;  
		},
		// 機体の追加処理
		addInstance: function(self) {
			this.pg.addChild(self);
			return this;
		},
		// 機体の削除処理
		removeInstance: function(self) {
			this.pg.removeChild(self);
			// 配列のdelete処理
			return this;
		},
		// ###############
		//   ラッパーメソッド（アクセサ）
		// ###############
		// キャラクターポジション
		setPosition: function(x, y) {
			//var args = Array.call(arguments);
			//if (args.length === 0) ?  : !!();
			this.x = x;
			this.y = y;
			return this;
		},
		// フレーム(アニメ)のセット
		setFrame: function(arr) {
			//var args = Array.slice.apply(arguments);
			//if (args.length <= 0) ?
			this.frame = arr;
			return this;
		},
		// 画像のセット
		setImage: function(imgSrc) {
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
					delete arr[self.uuid];
				} else {
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


	// ###########################
	//    スーパー	背景クラス
	// ###########################]
	var SuperBackground = Class.create(Sprite, {
		// コンストラクタ
		initialize: function(x, y, imgSrc, efFn, otFn){ // meはPlayGameインスタンスを指す
			Sprite.call(this, x, y);
			this.image = game.assets[imgSrc]
			// エンターフレーの処理
			var self = this;
			// フレーム処理
			this.addEventListener('enterframe', function() {
				if (efFn) efFn.call(self);
			});
			// ワンタイム関数
			if (otFn) otFn.call(self);
			return this;
		}
	});

	// ###########################
	//    スーパー	シーンクラス
	// ###########################
	var SuperScene = Class.create(Scene, {
		// コンストラクタ
		initialize: function(width, height, backgroundColor, addArr, efFn, tsFn){ // meはPlayGameインスタンスを指す
			//console.log('スーパークラスの継承');
			Scene.call(this);
			this.width = width;
			this.height = height;
			this.backgroundColor = backgroundColor;
			// 背景画像などの追加処理
			for (key in addArr)  {
				this.addChild(addArr[key]);
			}
			// フレームのイベント
			this.addEventListener('enterframe', function() {
				if (efFn) efFn();
			});
			// タッチ時のイベント
			this.addEventListener('touchstart', function() {
				if (tsFn) tsFn();
			});
			return this;
		}
	});

	// ###########################
	//    スーパー	サウンドクラス
	// ###########################
	var SuperSound = Class.create(Scene, {
		// コンストラクタ
		initialize: function(width, height, backgroundColor, addArr, efFn, tsFn){ // meはPlayGameインスタンスを指す
			//console.log('スーパークラスの継承');
			Scene.call(this);
			this.width = width;
			this.height = height;
			this.backgroundColor = backgroundColor;
			// 背景画像などの追加処理
			for (key in addArr)  {
				this.addChild(addArr[key]);
			}
			// フレームのイベント
			this.addEventListener('enterframe', function() {
				if (efFn) efFn();
			});
			// タッチ時のイベント
			this.addEventListener('touchstart', function() {
				if (tsFn) tsFn();
			});
			return this;
		}
	});

	// ###########################
	//    スーパー	背景クラス
	// ###########################]
	var SuperImage = Class.create(Sprite, {
		// コンストラクタ
		initialize: function(width, height, x, y, frame, imgSrc, toFn, efFn, otFn){ // meはPlayGameインスタンスを指す
			Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			this.image = game.assets[imgSrc]
			this.frame = frame;
			// エンターフレーの処理
			var self = this;
			// タッチ処理
			this.addEventListener('touchstart', function() {
				if (toFn) toFn.call(self);
			});
			// フレーム処理
			this.addEventListener('enterframe', function() {
				if (efFn) efFn.call(self);
			});
			// ワンタイム関数
			if (otFn) otFn.call(self);
			return this;
		}
	});

	// エクスポート
	window.super = {
		SuperLabel: SuperLabel,
		SuperSprite: SuperSprite,
		SuperBackground : SuperBackground,
		SuperScene: SuperScene,
		SuperImage: SuperImage
	};


});