var KAEDE_WIDTH = 95;
var KAEDE_HEIGHT = 135;
var frameList1 = [2,2,2,2,3,3,3,3];
var frameList2 = [4,4,4,4,5,5,5,5];


var Kaede = Class.create ( Sprite, {
    initialize : function() {
        Sprite.call ( this, KAEDE_WIDTH, KAEDE_HEIGHT );
        this.image = global.game.assets[ IMAGE_KAEDE ];
        this.x = (BACKGROUND_WIDTH - 220- 95)/2;
        this.y = BACKGROUND_HEIGHT - 194;
        this.tX = this.x;
        this.frameIndex = 0;
    }   
});

var TimePlus = Class.create ( Sprite, {
    initialize : function(){
        Sprite.call( this, 79, 49 );
        this.image = global.game.assets[ IMAGE_5sec ];
        this.x = BACKGROUND_WIDTH - 140;
        this.y = BACKGROUND_HEIGHT - 460;
        this.tl.fadeOut( 40 );
        this.tl.and();
        this.tl.moveBy(0, -20, 40);
        this.tl.removeFromScene();
   }
});