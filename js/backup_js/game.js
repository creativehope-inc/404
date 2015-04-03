var createGameScene = function() {
    var self       = this;
    var blocks     = [];
    var selectarea = [];
    var topBlock   = [];
    var button     = [];
    var kaedeMove  = false;
    var ballMove   = false;
    var label;
    var ichi;
    var juu;
    global.sound.out.setVolume(0.5);
    global.sound.limitcome.setVolume(0.3);
    global.sound.limit.setVolume(0.8);
    var scene      = new Scene();
    scene.backgroundColor = BACKGROUND_COLOR;

    //キーボード入力の設定
    global.game.keybind(81, "q");
    global.game.addEventListener("qbuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(126,kaede.y,25);
        KM({x:126});
    }
    });
    global.game.keybind(87, "w");
    global.game.addEventListener("wbuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(180,kaede.y,25);
        KM({x:180});
    }
    });
    global.game.keybind(69, "e");
    global.game.addEventListener("ebuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(233,kaede.y,25);
        KM({x:233});
    }
    });

    global.game.keybind(82, "r");
    global.game.addEventListener("rbuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(289,kaede.y,25);
        KM({x:289});
    }
    });

    global.game.keybind(84, "t");
    global.game.addEventListener("tbuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(343,kaede.y,25);
        KM({x:343});
    }
    });

    global.game.keybind(89, "y");
    global.game.addEventListener("ybuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(397,kaede.y,25);
        KM({x:397});
    }
    });

    global.game.keybind(85, "u");
    global.game.addEventListener("ubuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(452,kaede.y,25);
        KM({x:452});
    }
    });

    global.game.keybind(73, "i");
    global.game.addEventListener("ibuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(508,kaede.y,25);
        KM({x:508});
    }
    });

    global.game.keybind(79, "o");
    global.game.addEventListener("obuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(564,kaede.y,25);
        KM({x:564});
    }
    });

    global.game.keybind(80, "p");
    global.game.addEventListener("pbuttondown",function(e){
    if (!kaedeMove&&!ballMove) {
        kaede.tl.moveTo(620,kaede.y,25);
        KM({x:620});
    }
    });

    global.sound.start.play();
    global.sound.normal.play("none",0,0,-1);
    //移動したあとのカエデの挙動
    function KM(e) {
        kaedeMove = true;
        global.keybindFlag = false;
        if ( kaede.x > e.x ) {
            kaede.frame = frameList1;
        }else if(kaede.x < e.x){
            kaede.frame = frameList2;
        }
        kaede.tl.then( function ( ) {
            kaede.frame = 8;
            kaede.tl.delay(3).then (function(){kaede.frame = 9;});
            global.sound.nageru.play();
            magicCall( );
            ballMove = true;
            _.sortBy( blocks, function( block ) {
                return block.x + block.y * 10;
            });
        });
    }
    //背景
    var background = new Sprite( BACKGROUND_WIDTH - 220 , BACKGROUND_HEIGHT  );
    background.image = global.game.assets[ IMAGE_BACKGROUND ];
    scene.addChild( background );

    //右の枠
    var oth = new Sprite( 220, 540);
    oth.image = global.game.assets[ IMAGE_OTH ];
    oth.x = 740;
    oth.y = 0;
    scene.addChild( oth );

    //音のオンオフ
    var soundS = new Sprite (51,21);
    soundS.image = global.game.assets[IMAGE_SOUND];
    soundS.x = 15;
    soundS.y = 10;
    soundS.frame = global.soundType;
    soundS._style.zIndex = 1;
    soundS.ontouchstart = function(){
        if (soundS.frame === 0) {
            global.sound.unmute();
            soundS.frame = 1;
        }else{
            global.sound.mute();
            soundS.frame = 0;
        }
    };
    scene.addChild(soundS);

    //スコア用
    global.score = 0;
    var scoreLabel = new Label("SCORE : 0");
    scoreLabel.font = "16px Tahoma";
    scoreLabel.color = "red";
    scoreLabel.x = -9999;
    scene.addChild(scoreLabel);

    var score1 = new Sprite(64,80);
    score1.image = global.game.assets[IMAGE_SCORE];
    score1.frame = 0;
    score1.x = BACKGROUND_WIDTH - 200 + 41;
    score1.y = BACKGROUND_HEIGHT - 260;
    score1.on('enterframe', function() {
        this.frame = ichi;
    });
    scene.addChild(score1);

    var score2 = new Sprite(64,80);
    score2.image = global.game.assets[IMAGE_SCORE];
    score2.frame = 0;
    score2.x = BACKGROUND_WIDTH - 220;
    score2.y = BACKGROUND_HEIGHT - 260;
    score2.on( 'enterframe', function() {
        this.frame = juu;
    });
    scene.addChild(score2);

    global.progress = 0;
    global.game.frame = 0;

    //時間制限のバー
    var ProgressBar = Class.create( Sprite, {
        initialize : function() {
            var barSizeY = Math.floor( global.progress * 300 ) + 15;
            Sprite.call( this, 26 ,barSizeY );
            var surf = new Surface(100, 100);
            surf.context.beginPath();
            surf.context.fillStyle = 'rgba(256, 256, 256, 1.0)';
            surf.context.fillRect(0, 0, 26,barSizeY);
            this.image = surf;
            this.moveTo( 911, 103 );
        },
        onenterframe : function() {
            var parent = this.parentNode;
            parent.removeChild( this );
            parent.addChild( new ProgressBar() );
            scene.removeChild(gage);
            scene.addChild(gage);
        }
    });
    var progressBar = new ProgressBar();
    scene.addChild (progressBar);

    var gage = new Sprite(26,12);
    gage.image = global.game.assets[IMAGE_GAGE];
    gage.x = 911;
    gage.y = 407;
    gage._style.zIndex = 30;
    scene.addChild(gage);

    if (progressBar < 0.2) {
        global.sound.normal.stop();
        global.sound.limit.start();
    }

    //かえでの表示
    var kaede = new Kaede();
    scene.addChild( kaede );

    function magicCall( ) {
        var magic = new Magic( );
        magic.x = kaede.x - 40;    // キャラに対しての座標X
        magic.y = kaede.y + 44;// キャラに対しての座標Y
        scene.addChild( magic );
        return magic;
    }
    //    上のブロックの表示
    for( var i=0; i<4; i++ ) {
    for( var j=0; j<10; j++ ) {
            var rand = Math.floor( Math.random()*4 );//ランダムな数値
            switch ( rand ) {
                case 0:
                    blocks[i*10+j] = new Block_pi(j * ( 50+3 )+( BACKGROUND_WIDTH - 220- 53*10 )/2, i * (50+3 ));
                    break;
                case 1:
                    blocks[i*10+j] = new Block_co(j * ( 50+3 )+(BACKGROUND_WIDTH - 220- 53*10 )/2, i * ( 50+3 ));
                    break;
                case 2:
                    blocks[i*10+j] = new Block_mo(j * ( 50+3 )+(BACKGROUND_WIDTH - 220- 53*10 )/2, i * ( 50+3 ));
                    break;
                case 3:
                    blocks[i*10+j] = new Block_nn(j * ( 50+3 )+(BACKGROUND_WIDTH - 220- 53*10 )/2, i * ( 50+3 ));
                    break;
            }
        scene.addChild(blocks[i*10+j] );
    }
    }
    //右の枠の　次のブロックを表示
    function NEXTBLOCK () {
        var nextb = new NextBlock();
        var rnd = _.random(3);
        nextb.frame =　rnd;
        scene.addChild( nextb );
        return nextb;
    }


    function getKaedeBlock( nextb ) {
        //かえでのブロック
        var kaedeBlock;
        switch ( nextb.frame ) {
            case 0:
                kaedeBlock = new Block_pi();
                break;
            case 1:
                kaedeBlock = new Block_co();
                break;
            case 2:
                kaedeBlock = new Block_mo();
                break;
            case 3:
                kaedeBlock = new Block_nn();
                break;
            default:
                break;
        }
        kaedeBlock.x = kaede.x - 26;    // キャラに対しての座標X
        kaedeBlock.y = kaede.y + 50 ;   // キャラより少し上のY座標に
        kaedeBlock.scale( 0.5, 0.5 );
        scene.addChild( kaedeBlock );
        return kaedeBlock;
    }

    //配列に追加するブロック
    function tuikaBlock( x, y ) {
        var tb = new Sprite( 50, 50 );
        tb     = kaedeBlock;
        tb.x   = x;
        tb.y   = y;
        tb.setTop( blocks );
        tb.setRight(blocks);
        tb.setLeft(blocks);
        if ( tb instanceof Block_pi ) tb.checkBlock_pi();
        if ( tb instanceof Block_co ) tb.checkBlock_co();
        if ( tb instanceof Block_mo ) tb.checkBlock_mo();
        if ( tb instanceof Block_nn ) tb.checkBlock_nn();
        scene.addChild( tb );
        return tb;
    }


    //Y座標０の場合の追加ブロック判定スプライト
    for (var x=0; x<10; x++ ){
        topBlock[x] = new Sprite(50,50);
        topBlock[x].x = x * ( 50+3 )+( BACKGROUND_WIDTH - 220- 53*10 )/2; // X座標
        topBlock[x].y = 0; // Y座標
        scene.addChild(topBlock[x]);
    }
    //発射位置
    function SELECTAREA(blocks) {
        function eventCallback (e) {
            if (!kaedeMove&&!ballMove) {
                kaede.tl.moveTo(e.x - ( kaede.width/2-50 ) ,kaede.y,25 );
                KM(e);
            }
        }
        for ( var x=0; x<10; x++ ){
            selectarea[x] = new Sprite( 42, 41 );
            selectarea[x].image = global.game.assets[ IMAGE_KEY ];
            selectarea[x].frame = x;
            selectarea[x].y = BACKGROUND_HEIGHT - 50;
            selectarea[x].x =  x * (50+4)+( BACKGROUND_WIDTH - 220- 53*10  )/2;
            selectarea[x]._style.zIndex = 1;
            selectarea[x].addEventListener ( Event.TOUCH_START, eventCallback );
            scene.addChild(selectarea[x]);
        }
        return selectarea[x];
    }

    //ブロックを描く
    var nextb = NEXTBLOCK( );
    var kaedeBlock = getKaedeBlock( nextb );
    SELECTAREA();


    scene.addEventListener ( Event.ENTER_FRAME, function ( e ) {
        if ( ballMove ) {
            kaedeBlock.y = kaedeBlock.y - 8;
            kaedeBlock.tl.scaleTo( 1, 1, 30 );
            if (kaedeBlock.y < -10) {
                ballMove = false;
            }
        }
        if ( !ballMove ) {
            kaedeBlock.x = kaede.x - 26;    // キャラに対しての座標X
            kaedeBlock.y = kaede.y +50;   // キャラより少し上のY座標に
        }
            //接触判定
        for ( var j = 0; j < blocks.length; j++ ) {
            if ( kaedeBlock.within( blocks[j], 27 ) ) {
                global.sound.hamaru.play();
                blocks.push( tuikaBlock( blocks[j].x, blocks[j].y+53 ));
                ballMove = false;
                kaede.frame = 0;
                kaedeBlock = getKaedeBlock( nextb );
                scene.removeChild( nextb );
                nextb = NEXTBLOCK( );
                kaedeMove = false;
            }
            if (blocks[j].moveFlag) {
                if (blocks[j].within(blocks[j],50) ) {
                    blocks[j].moveFlag = false;
                }
            }
            if (blocks[j].y >= 424 && !vanishFlag) {//一定ラインに到達してブロックが消せなかったときゲーム終了
                kaede.frame = 6;
                global.sound.limit.stop();
                global.sound.normal.stop();
                global.sound.out.play();
                setTimeout(global.game.replaceScene( createGameOverScene() ), 6000);
            }
        }
        for (var b = 0; b < topBlock.length; b++ ){
            if ( kaedeBlock.within( topBlock[b], 20 ) ) {
                global.sound.hamaru.play();
                blocks.push( tuikaBlock( topBlock[b].x, 0));
                ballMove = false;
                kaede.frame = 0;
                kaedeBlock = getKaedeBlock( nextb );
                scene.removeChild( nextb );
                nextb = NEXTBLOCK( );
                kaedeMove = false;
            }
        }
            //消すための処理
        _.each(blocks, function (block){
            if (block.opacity < 0 ) {
                global.sound.vanish.play();
                scene.removeChild( block );
                blocks  = _.without( blocks, block );
                global.score = global.score +1/4;
                scoreLabel.text = "SCORE : "+global.score;
                var timePlus = new TimePlus();
                scene.addChild(timePlus);
                GAME_TIME_LIMIT = GAME_TIME_LIMIT +500/4;
            }
        });

        vanishFlag = _.chain( blocks ).pluck( 'frame' ).contains( 2 ).value();
        _.each(blocks, function (block){
            if ( block.y !== 0 && !block.moveFlag && !getUpBlock( blocks, block ) ) {
                block.moveFlag = true;
                checkMoveBlocks( blocks, block );
            }
        });

        _.each(blocks, function (block){
            if (block.y > 0 && block.moveFlag ) {
                block.y = block.y-53/4;
                block.setTop( blocks );
                block.setRight(blocks);
                block.setLeft(blocks);
                if ( block instanceof Block_pi ) block.checkBlock_pi();
                if ( block instanceof Block_co ) block.checkBlock_co();
                if ( block instanceof Block_mo ) block.checkBlock_mo();
                if ( block instanceof Block_nn ) block.checkBlock_nn();
            }
        });
        //スコアーに応じてスプライトが変わる
        ichi = (global.score%10);
        juu = (global.score%100)/10;

        global.progress = global.game.frame / GAME_TIME_LIMIT;

        //タイムリミットの判定
        if ( global.progress > 1 ) {
            kaede.frame = 6;
            setTimeout(global.game.replaceScene( createGameOverScene() ), 1000);
            global.sound.limit.stop();
            global.sound.out.play();
        }
        if ( global.progress == 0.8 ) {
            global.sound.normal.stop();
            global.sound.limitcome.play();
            global.sound.limit.play("none",0,0,-1);
        }

    });
    return scene;
};


function checkMoveBlocks( blocks, b ) {
    var ub = getUnderBlock( blocks, b );
    if ( ub ){
        ub.moveFlag = true;
        checkMoveBlocks( blocks, ub );
    }
}

function getUnderBlock( blocks, b ) {
    return _.find( blocks, function ( block ){
        return block.x == b.x && block.y == b.y + 53;
    });
}
function getUpBlock( blocks, b ) {
    return _.find( blocks, function ( block ){
        return block.x == b.x && block.y == b.y - 53;
    });
}