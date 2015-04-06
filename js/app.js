// 参考文献
// http://jsdo.it/takuma791/nDxC

(function() {

    // 縁ちゃんとのおまじない
    enchant();
     
    // ゲーム画面を生成
    var game = new Game(320, 320);
    // ゲームに必要な画像をプリリロード
    game.preload('http://battamon.net:8080/kaneko_game/404/img/banner_foot.jpg');
    // ゲームの初期処理
    game.onload = function () {
      // ここに処理を書いていきます。
    };
    game.start();


}());
