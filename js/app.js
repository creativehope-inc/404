// 参考文献
// http://jsdo.it/takuma791/nDxC

(function() {

    // おまじない
    enchant();

    // セッティングobj
    var settings = {
        SCREEN_WIDTH:320, // スクリーンの幅
        SCREEN_HEIGHT: 320, // スクリーンの高さ
        PLAYER_WIDTH: 32, // 自機の幅
        PLAYER_HEIGHT: 32, // 自機の高さ
        PLAYER_SPEED: 8, // 自機の速度
        BULLET_WIDTH: 24, // 球の幅
        BULLET_HEIGHT: 56, // 球の高さ
        BULLET_SPEED: 18, // 球の速度
        ENEMY_WIDTH: 60, // 敵の幅
        ENEMY_HEIGHT: 60, // 敵の高さ
        ENEMY_SPEED: 4, // 敵の速度
        ENEMY_CREATE_INTERVAL: 15, // 敵出現インターバル
        BACKGROUND_WIDTH: 320,
        BACKGROUND_HEIGHT: 2348,
        SCROLL_SPEED: 4,
        PLAYER_IMAGE:"http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter04/player.png",
        ENEMY_IMAGE: "http://jsrun.it/assets/r/n/o/N/rnoNB.png",
        BULLET_IMAGE: "http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter04/bullet.png",
        BACKGROUND_IMAGE: "http://jsrun.it/assets/8/h/O/w/8hOwB.png"
    };

    // プレイヤーのデータを保存する配列
    var ASSETS = [
        settings.PLAYER_IMAGE,
        settings.ENEMY_IMAGE,
        settings.BULLET_IMAGE,
        settings.BACKGROUND_IMAGE
    ];

    // ストア
    var game = null;
    var player = [];
    var enemyList = [];
    var bulletList = [];
    var scoreLabel = [];

    // プロトタイプ拡張
    Array.prototype.erase = function(elm) {
        var index = this.indexOf(elm);
        this.splice(index, 1);
        return this;
    };

    // レンダーフロート
    var randfloat = function(min, max) {
        return Math.random() * (max - min) + min;
    };

    // ローディング時
    window.onload = function() {

        // ゲーム生成
        game = new Game(
            settings.SCREEN_WIDTH,
            settings.SCREEN_HEIGHT
        );
        // プリリロード
        game.preload(ASSETS);
        
        // ゲームの開始
        game.onload = function() {
            var scene = game.rootScene;
            scene.backgroundColor = "#8cc";
            
            var background = new Sprite(settings.BACKGROUND_WIDTH, settings.BACKGROUND_HEIGHT);
            background.image = game.assets[settings.BACKGROUND_IMAGE];
            background.moveTo(0, -background.height + game.height);
            background.onenterframe = function() {
                this.y += settings.SCROLL_SPEED;
                if (this.y >= 0)
                    background.moveTo(0, -background.height + game.height);
            };
            scene.addChild(background);

            // プレイヤー生成
            scene.onenter = function() {
                game.frame = 0;
                
                // パッドを生成し、表示
                var pad = new Pad();
                pad.moveTo(10, settings.SCREEN_HEIGHT - 100);
                pad._element.style.zIndex = 100;
                scene.addChild(pad);
                // プレイヤー生成
                player = new Player();
                player.moveTo(settings.SCREEN_WIDTH / 2 - settings.PLAYER_WIDTH / 2, settings.SCREEN_HEIGHT - settings.PLAYER_HEIGHT);
                scene.addChild(player);

                scoreLabel = new ScoreLabel(10, 10);
                scoreLabel.score = 0;
                scoreLabel._element.style.zIndex = 100;
                scene.addChild(scoreLabel);
            };
            
            // 敵出現
            scene.onenterframe = function() {
                if (game.frame % settings.ENEMY_CREATE_INTERVAL == 0) { // 1/15で実行
                    var enemy = new Enemy();
                    var x = randfloat(0, settings.SCREEN_WIDTH - settings.ENEMY_WIDTH);
                    var y = -20;
                    enemy.moveTo(x, y);
                    //enemyList = [];
                    enemyList.push(enemy);
                    scene.addChild(enemy);
                }

                // 出現頻度
                if (game.frame % 30 < 20 && game.frame % 5 == 0) {
                    var bullet = new Bullet();
                    //player.x = player.x || 0;
                    //palyer.y = player.y || 0;
                    //bullet.moveTo(player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, player.y - 20);
                    bulletList = [];
                    bulletList.push(bullet);
                    scene.addChild(bullet);
                }
                
                // 衝突判定(Player と Enemy)
                for (var i=0, len=enemyList.length; i<len; i++) {
                    var enemy = enemyList[i];
                    if (enemy.intersect(player)) {
                        var score = scoreLabel.score;
                        var msg = scoreLabel.score + "point get!!";
                        game.end(score, msg);
                    }
                }
                
                // 衝突判定(Bullet と Enemy)
                for (var i=0, len=enemyList.length; i<len; i++) {
                    var enemy = enemyList[i];
                    if (enemy.destroy === true)
                        continue;
                    for (var j=0, len2 = bulletList.length; j<len2; j++) {
                        var bullet = bulletList[j];
                        if (bullet.intersect(enemy) === true) {
                            enemy.destroy = true;
                            bullet.destroy = true;
                            scoreLabel = [];
                            scoreLabel.score += 100;
                            break;
                        }
                    }
                }
            };
        };
        
        game.start();
    };

    // プレイヤー
    var Player = Class.create(Sprite, {
        initialize: function() {
            Sprite.call(this, settings.PLAYER_WIDTH, settings.PLAYER_HEIGHT);
            this.image = game.assets[settings.PLAYER_IMAGE];
            this.frame = 0;
        },
        onenterframe: function() {
            var input = game.input;
            var vx = 0, vy = 0;
            
            if (input.left == true) {
                vx = -settings.PLAYER_SPEED;
                this.frame = 1;
            }
            else if (input.right == true) {
                vx = settings.PLAYER_SPEED;
                this.frame = 2;
            }
            else {
                this.frame = 0;
            }
            
            if (input.up == true)
                vy = -settings.PLAYER_SPEED;
            else if (input.down == true)
                vy = settings.PLAYER_SPEED;
            
            if (vx !== 0 && vy !== 0) {
                var length = Math.sqrt(vx*vx + vy*vy);
                vx /= length;
                vy /= length;
                vx *= settings.PLAYER_SPEED;
                vy *= settings.PLAYER_SPEED;
            }
            
            this.moveBy(vx, vy);
            
            var left = 0;
            var right = settings.SCREEN_WIDTH - this.width;
            var top = 0;
            var bottom = settings.SCREEN_HEIGHT - this.height;
            
            if (this.x < left)
                this.x = left;
            else if (this.x > right)
                this.x = right;
            if (this.y < top)
                this.y = top;
            else if (this.y > bottom)
                this.y = bottom;
        }
    });

    // 球
    var Bullet = Class.create(Sprite, {
        initialize: function() {
            Sprite.call(this, settings.BULLET_WIDTH, settings.BULLET_HEIGHT);
            this.image = game.assets[settings.BULLET_IMAGE];
            this.destroy = false;
        },
        onenterframe: function() {
            this.y -= settings.BULLET_SPEED;
            if (this.y < -20 || this.destroy === true) {
                this.parentNode.removeChild(this);
                bulletList.erase(this);
            }
        }
    });

    // 敵
    var Enemy = Class.create(Sprite, {
        initialize: function() {
            Sprite.call(this, settings.ENEMY_WIDTH, settings.ENEMY_HEIGHT);
            this.image = game.assets[settings.ENEMY_IMAGE];
            this.destroy = false;
        },
        onenterframe: function() {
            // 敵の動き
            this.y += settings.ENEMY_SPEED;
            // 破壊処理
            if (this.y > settings.SCREEN_HEIGHT || this.destroy === true) {
                this.parentNode.removeChild(this);
                enemyList.erase(this);
            }
        }
    });

}());
