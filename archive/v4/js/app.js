﻿var define=function(){return function(){var e=document.createElement("script");e.src="https://www.picomon.jp/game/get_solt.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);var n={debug:!1,gameWidth:960,gameHeight:640,bulletWidht:16,bulletHieht:16,playerBulletAgility:10,playerHitpoint:3,maxPlayerHitpoint:10,minPlayerHitpoint:1,playerAgility:5,maxPlayerAgility:20,enemyBulletAgility:10,enemyAgility:4,enemyPower:1,itemAgility:4,labelFontSize:"20px cursive new, arial, sans-serif",playerWidth:32,playerHeight:32,enemyTypeOne:1,enemyTypeTwo:2,enemyTypeThreeHead:30,enemyTypeThreeHeadRibon:40,enemyTypeThreeBody:50,enemyTypeThreeBodyRibon:60,enemyTypeOneHitpoint:3,enemyTypeTwoHitpoint:5,enemyTypeThreeHeadHitpoint:100,enemyTypeThreeHeadRibbonHitpoint:50,enemyTypeThreeBodyHitpoint:100,enemyTypeThreeBodyRibbonHitpoint:50},i="assets/",o={background:i+"img/background1.png",test:i+"img/chara1.png",player:i+"img/chara2.png",bullet:i+"img/icon0.png",title:i+"img/background.png",battle:i+"img/battle.jpg",explosion:i+"img/effect0.png",cure:i+"img/heal_eff_thumb.png",shooter:i+"img/shooter_06.png",head:i+"img/kao.png",head_2:i+"img/mie_3.png",body:i+"img/body.png",body_r:i+"img/ribbon_2.png",head_r:i+"img/ribbon.png",twitter:i+"img/Twitter.png",facebook:i+"img/Facebook.png",ranking:i+"img/Ranking.png",startButton:i+"img/start.png",soundButton:i+"img/sound.png",mainSound:i+"sound/mp3/404game_main.mp3",hittedSound:i+"sound/mp3/404game_hitted.mp3",fired:i+"sound/mp3/404game_bullet_fire.mp3",enemyCrashed:i+"sound/mp3/404game_enemy_crash.mp3",getItem:i+"sound/mp3/404game_item.mp3",gameOverSound:i+"sound/mp3/404game_gameover.mp3",bossEnter:i+"sound/mp3/404game_boss_enter.mp3",bossCrashed:i+"sound/mp3/404game_boss_crash.mp3",submitButton:i+"img/submit_button.png"},m={playerHitpoint:"",playerAgility:"",bossHitpoint:"",gamePoint:"",startTime:"",gameTime:"",currentScene:"",MajiFlag:!1,music:!1,zakoEnemyCounter:0,zakoEnemy2Counter:0,bossHeadCounter:0,bossHeadRibonCounter:0,bossBodyCounter:0,bossBodyRibonCounter:0},r=[],a=[],g=[];if(enchant(),1==n.debug){var p=function(){};console.log=p}var s=new Core(n.gameWidth,n.gameHeight);return s.fps=30,s.keybind(32,"space"),s.keybind(16,"shift"),s.preload(o.background,o.test,o.player,o.bullet,o.title,o.explosion,o.cure,o.shooter,o.head,o.head_2,o.body,o.body_r,o.head_r,o.mainSound,o.hittedSound,o.fired,o.enemyCrashed,o.getItem,o.gameOverSound,o.startButton,o.soundButton,o.bossEnter,o.bossCrashed,o.twitter,o.facebook,o.ranking,o.submitButton),{game:s,setting:n,files:o,store:m,playerArr:r,enemyArr:a,itemArr:g}}}();
var base=function(){return function(t){var e=t.game,i=t.setting,n=(t.files,t.store,t.playerArr,t.enemyArr,t.itemArr,Class.create(Label,{initialize:function(t,e,i,n,r,s,a,h,c,l){Label.call(this,a),this.x=t,this.y=e,this.color=r,this.font=s,this.text=a||"";var o=this;$(this).on("enterframe",function(){h&&h.call(o)}),$(this).on("touchstart",function(){c&&c.call(o)}),l&&l.call(o,o)}})),r=Class.create(Sprite,{initialize:function(t,e,i){return Sprite.call(this,t,e),this.pg=i,this},addInstance:function(t){return this.pg.addChild(t),this},removeInstance:function(t){return t.clearEventListener("enterframe"),t.pg.removeChild(t),this},setPosition:function(t,e){return this.x=t,this.y=e,this},setFrame:function(t){return this.frame=t,this},setImage:function(t){return this.image=e.assets[t],this},getOut:function(t,e){(t.x>i.gameWidth||t.x<0)&&(this._isArray(e)?(t.removeInstance(t),delete e[t.uuid]):t.removeInstance(t),t.clearEventListener("enterframe"))},_isArray:function(t){return t&&"object"==typeof t&&"number"==typeof t.length&&"function"==typeof t.splice&&!t.propertyIsEnumerable("length")}}),s=Class.create(Sprite,{initialize:function(t,i,n,r,s){Sprite.call(this,t,i),this.image=e.assets[n];var a=this;return $(this).on("enterframe",function(){r&&r.call(a)}),s&&s.call(a),this}}),a=Class.create(Scene,{initialize:function(t,e,i,n,r,s,a){Scene.call(this),this.width=t,this.height=e,this.backgroundColor=i;for(var h in n)this.addChild(n[h]);return $(this).on("enterframe",function(){r&&r()}),$(this).on("touchstart",function(){s&&s()}),a&&a.call(this),this}}),h=(Class.create(Scene,{initialize:function(t,e,i,n,r,s){Scene.call(this),this.width=t,this.height=e,this.backgroundColor=i;for(var a in n)this.addChild(n[a]);return $(this).on("enterframe",function(){r&&r()}),$(this).on("touchstart",function(){s&&s()}),this}}),Class.create(Sprite,{initialize:function(t,i,n,r,s,a,h,c,l){Sprite.call(this,t,i),this.x=n,this.y=r,this.image=e.assets[a],this.frame=s;var o=this;return $(this).on("touchstart",function(){h&&h.call(o)}),$(this).on("enterframe",function(){c&&c.call(o)}),l&&l.call(o),this}})),c=Class.create(Entity,{initialize:function(t,e,i,n,r,s,a,h,c){Entity.call(this),this.width=t,this.height=e,this.x=i,this.y=n,this._element=r,this._element.type=s,this._element.name=a,this._element.id=h;var l=this;return this.addEventListener("enterframe",function(){c&&c.call(l)}),this}}),l=function(t,e,i){var n=t.rootScene;for(var r in e)n.addChild(e[r]);return n.addEventListener("enterframe",function(){i&&i()}),n};return{SuperLabel:n,SuperSprite:r,SuperBackground:s,SuperScene:a,SuperImage:h,SuperEntity:c,SuperRootScene:l}}}();
var sub=function(){return function(e,t){var i=e.game,s=e.setting,n=e.files,a=e.store,h=e.playerArr,r=e.enemyArr,o=(e.itemArr,t.SuperLabel,t.SuperSprite),y=Class.create(o,{initialize:function(e,t,i,s){return o.call(this,e,t,s),this._setUUID(i),this},_setUUID:function(e){return this.uuid=e,this},saveStore:function(e){return e[this.uuid]=this,this}}),l=Class.create(y,{initialize:function(e,t,a,h){y.call(this,32,32,a,h),this.setPosition(e,t),this.setImage(n.shooter),this.fired=i.assets[n.fired].clone(),this.enemyCrashed=i.assets[n.enemyCrashed].clone(),this.bossCrashed=i.assets[n.bossCrashed].clone();var o=this;return this.addEventListener("enterframe",function(){for(var e in r)r[e].intersect(o)&&(r[e].type==s.enemyTypeThreeBody||r[e].type==s.enemyTypeThreeHead||r[e].type==s.enemyTypeThreeBodyRibon||r[e].type==s.enemyTypeThreeHeadRibon?o._crashBoss(r,e,h,o):o._crashEnemy(r,e,o,h));this._checkHP(h),this._controll(h)}),this.addInstance(this),this._came(),this},_came:function(){return this.tl.moveBy(s.gameWidth/2,1,30,enchant.Easing.QUAD_EASEINOUT).and().rotateTo(3600,30,enchant.Easing.LINEAR).and().scaleTo(3,3,30).and().rotateTo(3600,30,enchant.Easing.LINEAR).moveTo(0,s.gameHeight/2,30).and().scaleTo(1,1,30),this},_crashEnemy:function(e,t,i,n){new A(this.x,this.y,n),a.playerHitpoint<=0||(a.playerHitpoint-=s.enemyPower),e[t].hitpoint-=3,a.music&&this.enemyCrashed.play()},_crashBoss:function(e,t,i,n){new A(this.x,this.y,i),a.playerHitpoint<=0||(a.playerHitpoint-=s.enemyPower),e[t].hitpoint-=3,a.music&&n.bossCrashed.play()},_controll:function(e){this.setFrame([0,1]),i.input.left&&this.x>0&&(this.x-=a.playerAgility),i.input.right&&this.x<s.gameWidth-this.width&&(this.x+=a.playerAgility),i.input.up&&this.y>0&&(this.y-=a.playerAgility,this.frame=2),i.input.down&&this.y<s.gameHeight-this.height&&(this.y+=a.playerAgility,this.frame=3),0==i.input.up&&0==i.input.down&&this.setFrame(1==this.frame?0:1),i.input.space&&i.frame%2==0&&(new C(this.x,this.y,e),a.music&&this.fired.play())},_checkHP:function(e){if(a.playerHitpoint<=0){this.removeInstance(this);for(var t=-10;10>t;t++)for(var i=-10;10>i;i++)new A(this.x+5*i,this.y+5*t,e);setTimeout(function(){a.currentScene="gameover"},2e3)}}}),c=Class.create(y,{initialize:function(e,t,i,s,n,a,h){return y.call(this,e,t,n,a),this.setPosition(i,s),this.setType(h),this.setHP(),this},setType:function(e){this.type=e},setHP:function(){switch(this.type){case s.enemyTypeOne:this.hitpoint=s.enemyTypeOneHitpoint;break;case s.enemyTypeTwo:this.hitpoint=s.enemyTypeTwoHitpoint;break;case s.enemyTypeThreeHead:this.hitpoint=s.enemyTypeThreeHeadHitpoint;break;case s.enemyTypeThreeHeadRibon:this.hitpoint=s.enemyTypeThreeHeadRibbonHitpoint;break;case s.enemyTypeThreeBody:this.hitpoint=s.enemyTypeThreeBodyHitpoint;break;case s.enemyTypeThreeBodyRibon:this.hitpoint=s.enemyTypeThreeBodyRibbonHitpoint}},addCounter:function(e){switch(e.type){case s.enemyTypeOne:a.zakoEnemyCounter++,a.gamePoint+=s.enemyTypeOne;break;case s.enemyTypeTwo:a.zakoEnemy2Counter++,a.gamePoint+=s.enemyTypeTwo;break;case s.enemyTypeThreeHead:a.bossHeadCounter++,a.gamePoint+=s.enemyTypeThreeHead;break;case s.enemyTypeThreeHeadRibon:a.bossHeadRibonCounter++,a.gamePoint+=s.enemyTypeThreeHeadRibon;break;case s.enemyTypeThreeBody:a.bossBodyCounter++,a.gamePoint+=s.enemyTypeThreeBody;break;case s.enemyTypeThreeBodyRibon:a.bossBodyRibonCounter++,a.gamePoint+=s.enemyTypeThreeBodyRibon}}}),m=Class.create(c,{initialize:function(e,t,i,n){c.call(this,32,32,e,t,i,n,s.enemyTypeOne)},_checkHP:function(e){this.hitpoint<=0&&(!!this.removeInstance(this),!!delete r[this.uuid],a.music&&this.enemyCrashed.play(),this.addCounter(e),delete this)}}),u=Class.create(m,{initialize:function(e,t,a,h){c.call(this,32,32,e,t,a,h,s.enemyTypeOne),this.setFrame([4,5]),this.setImage(n.shooter),this.addInstance(this),this.enemyCrashed=i.assets[n.enemyCrashed].clone();var o=this;this.addEventListener("enterframe",function(){o._move(),o._checkHP(o),i.frame%50==0&&new H(this.x-this.width,this.y,h),o.getOut(o,r)})},_move:function(){this.x-=s.enemyAgility}}),d=Class.create(m,{initialize:function(e,t,a,h){c.call(this,32,32,e,t,a,h,s.enemyTypeTwo),this.setFrame([6,7]),this.setImage(n.shooter),this.addInstance(this),this.enemyCrashed=i.assets[n.enemyCrashed].clone();var o=this;this.addEventListener("enterframe",function(){o._move(),o._checkHP(o),i.frame%50==0&&new I(this.x-this.width,this.y,h),o.getOut(o,r)})},_move:function(){this.x-=s.enemyAgility,this.y=220*Math.cos(this.x*Math.PI/180)+300}}),p=Class.create(c,{initialize:function(e,t,s,h,r,o,y){c.call(this,e,t,s,h,r,o,y),this.bossEnter=i.assets[n.bossEnter].clone(),this.bossCrashed=i.assets[n.bossCrashed].clone();var l=this;this.addEventListener("enterframe",function(){if(0==a.MajiFlag){if(i.frame%10==0){var e=Math.floor(5*Math.random()+0);new B(l.x,l.y,o,e)}}else if(i.frame%100==0)for(var t=0;5>t;t++)for(var s=-5;5>s;s++)0!=t&&0!=s&&new P(l.x,l.y,o,t,s);0==l.hitpoint&&(l.opacity=.7==l.opacity?.5:.7)})},move:function(){this.tl.moveBy(-100,100,30,enchant.Easing.QUAD_EASEINOUT).moveBy(100,-100,30,enchant.Easing.QUAD_EASEINOUT).moveBy(-100,-100,30,enchant.Easing.QUAD_EASEINOUT).moveBy(100,100,30,enchant.Easing.QUAD_EASEINOUT).loop()},action:function(){this.tl.moveBy(s.gameWidth/5,1,30,enchant.Easing.QUAD_EASEINOUT),a.music&&this.bossEnter.play()},die:function(){},checkHP:function(e,t){return e.hitpoint<=0?(!!delete r[e.uuid],a.music&&e.bossCrashed.play(),t&&t(),!0):!1}}),f=Class.create(p,{initialize:function(e,t,h,r){p.call(this,144,166,e,t,h,r,s.enemyTypeThreeHead),this.setFrame([1]),this.setImage(n.head),this.bossCrashed=i.assets[n.bossCrashed].clone(),this.addInstance(this);var o=this;this.action();var y=!1,l=!1;this.addEventListener("enterframe",function(){a.MajiFlag?l||(o.setImage(n.head_2),o.setFrame([1]),l=!0):i.frame%10==0&&this.setFrame(1==this.frame?[2]:[1]),this.move(),y||(y=o.checkHP(o,function(){o.addCounter(o)}))})}}),T=Class.create(p,{initialize:function(e,t,a,h){p.call(this,194,246,e,t,a,h,s.enemyTypeThreeBody),this.setFrame([1]),this.setImage(n.body),this.bossCrashed=i.assets[n.bossCrashed].clone(),this.addInstance(this);var r=this;this.action();var o=!1;this.addEventListener("enterframe",function(){this.move(),o||(o=r.checkHP(r,function(){r.addCounter(r)}))})}}),g=Class.create(p,{initialize:function(e,t,h,r){p.call(this,78,56,e,t,h,r,s.enemyTypeThreeHeadRibon),this.setFrame([1]),this.setImage(n.head_r),this.bossCrashed=i.assets[n.bossCrashed].clone(),this.addInstance(this);var o=this;this.action();var y=!1;this.addEventListener("enterframe",function(){o.move(),y||(y=o.checkHP(o,function(){o.addCounter(o),a.MajiFlag=!0,!!o.removeInstance(o)}))})}}),v=Class.create(p,{initialize:function(e,t,a,h){p.call(this,40,31,e,t,a,h,s.enemyTypeThreeBodyRibon),this.setFrame([1]),this.setImage(n.body_r),this.bossCrashed=i.assets[n.bossCrashed].clone(),this.addInstance(this);var r=this;this.action();var o=!1;this.addEventListener("enterframe",function(){this.move(),o||(o=r.checkHP(r,function(){r.addCounter(r)}))})}}),b=Class.create(o,{initialize:function(e,t,i){return o.call(this,e,t,i),this},hitEntity:function(e,t,i,s){for(var n in t)e.intersect(t[n])&&(this.pg.removeChild(e),s&&s(t,n,i))}}),E=Class.create(b,{initialize:function(e,t,i){return b.call(this,e,t,i),this}}),C=Class.create(E,{initialize:function(e,t,a){E.call(this,16,16,a),this.setPosition(s.playerWidth+e,s.playerHeight/4+t),this.setImage(n.bullet),this.setFrame([50]),this.bulletSound=i.assets[n.hittedSound].clone(),this.addInstance(this);var h=this;return this.addEventListener("enterframe",function(){h.x+=s.playerBulletAgility,h.hitEntity(h,r,a,function(e,t,i){e[t].type==s.enemyTypeThreeBody||e[t].type==s.enemyTypeThreeHead||e[t].type==s.enemyTypeThreeBodyRibon||e[t].type==s.enemyTypeThreeHeadRibon?h._hitBoss(e,t,h,i):h._hitEnemy(e,t,h,i)}),h.getOut(h,null)}),this},_hitEnemy:function(e,t,i,s){new A(i.x,i.y,s),a.music&&this.bulletSound.play(),e[t].hitpoint--},_hitBoss:function(e,t,i,n){0==a.MajiFlag?e[t].type==s.enemyTypeThreeHeadRibon?(new A(i.x,i.y,n),a.music&&this.bulletSound.play(),e[t].hitpoint--):new z(i.x,i.y,n):(new A(i.x,i.y,n),e[t].hitpoint--,a.music&&this.bulletSound.play())}}),H=Class.create(E,{initialize:function(e,t,r){E.call(this,16,16,r),this.setPosition(s.playerWidth+e,s.playerHeight/2+t),this.setImage(n.bullet),this.setFrame([62]),this.addInstance(this),this.hitSound=i.assets[n.enemyCrashed].clone();var o=this;return this.addEventListener("enterframe",function(){o.x-=s.playerBulletAgility,o.hitEntity(o,h,r,function(e,t,i){new A(o.x,o.y,i),a.playerHitpoint<=0||(a.playerHitpoint-=s.enemyPower),a.music&&o.hitSound.play()}),o.getOut(o,null)}),this}}),I=Class.create(E,{initialize:function(e,t,i){E.call(this,16,16,i),this.setPosition(s.playerWidth+e,s.playerHeight/2+t),this.setImage(n.bullet),this.setFrame([62]),this.addInstance(this);var r=this;return this.addEventListener("enterframe",function(){r.x-=s.playerBulletAgility,r.hitEntity(r,h,i,function(e,t,i){new A(r.x,r.y,i),a.playerHitpoint<=0||(a.playerHitpoint-=s.enemyPower)}),r.getOut(r,null)}),this}}),B=Class.create(E,{initialize:function(e,t,r,o){E.call(this,16,16,r),this.setPosition(s.playerWidth+e,s.playerHeight/2+t),this.setImage(n.bullet),this.setFrame([62]),this.addInstance(this),this.hitSound=i.assets[n.enemyCrashed].clone();var y=this;return this.addEventListener("enterframe",function(){y.x-=10,y.y-=o,y.hitEntity(y,h,r,function(e,t,i){new A(y.x,y.y,i),a.music&&y.hitSound.play(),a.playerHitpoint<=0||(a.playerHitpoint-=s.enemyPower)}),y.getOut(y,null)}),this}}),P=Class.create(E,{initialize:function(e,t,r,o,y){E.call(this,16,16,r),this.setPosition(s.playerWidth+e,s.playerHeight/2+t),this.setImage(n.bullet),this.setFrame([62]),this.addInstance(this),this.hitSound=i.assets[n.enemyCrashed].clone();var l=this;return this.addEventListener("enterframe",function(){var e=Math.floor(2*Math.random()+1);l.x-=o*e*2,l.y-=y*e,l.hitEntity(l,h,r,function(e,t,i){new A(l.x,l.y,i),a.music&&l.hitSound.play(),a.playerHitpoint<=0||(a.playerHitpoint-=s.enemyPower)}),l.getOut(l,null)}),this}}),w=Class.create(b,{initialize:function(e,t,a){b.call(this,e,t,a),this.setImage(n.bullet),this.sound=i.assets[n.getItem].clone();var h=this;return this.addEventListener("enterframe",function(){h.x-=s.itemAgility,h.getOut(h,null)}),this}}),x=Class.create(w,{initialize:function(e,t,i){w.call(this,16,16,i),this.setPosition(e,t),this.setImage(n.bullet),this.setFrame([10]),this.addInstance(this);var r=this;return this.addEventListener("enterframe",function(){r.hitEntity(r,h,i,function(e,t,i){new z(r.x,r.y,i),a.music&&r.sound.play(),a.playerHitpoint<s.maxPlayerHitpoint&&a.playerHitpoint++})}),this}}),_=Class.create(w,{initialize:function(e,t,i){w.call(this,16,16,i),this.setPosition(e,t),this.setImage(n.bullet),this.setFrame([13]),this.addInstance(this);var r=this;return this.addEventListener("enterframe",function(){r.hitEntity(r,h,i,function(e,t,i){new z(r.x,r.y,i),a.music&&r.sound.play(),a.playerAgility<s.maxPlayerAgility&&(a.playerAgility+=5)})}),this}}),A=Class.create(o,{initialize:function(e,t,i){o.call(this,16,16,i),this.setPosition(e,t),this.setImage(n.explosion),this.setFrame([1,2,3,4,5]),this.addInstance(this);var s=this;return this.addEventListener("enterframe",function(){5==s.frame&&s.removeInstance(s)}),this}}),z=Class.create(o,{initialize:function(e,t,i){o.call(this,16,16,i),this.setPosition(e,t),this.setImage(n.cure),this.setFrame([1,2,3,4]),this.addInstance(this);var s=this;return this.addEventListener("enterframe",function(){4==s.frame&&s.removeInstance(s)}),this}});return{Aircraft:y,Player:l,Enemy:c,ZakoEnemy:u,ZakoEnemy2:d,BossEnemy:p,BossEnemyHead:f,BossEnemyBody:T,BossEnemyHeadRibbon:g,BossEnemyBodyRibbon:v,Things:b,Bullet:E,PlayerBullet:C,EnemyBullet:H,EnemyBullet2:I,BossBullet1:B,BossBullet2:P,Item:w,RecoveryItem:x,SpeedItem:_,Explosion:A,Cure:z}}}();
$(function(){function e(e,n,t,o,r){e?n!=t&&(t?(o.play(),r&&(o.src.loop=!0)):(o.pause(),r&&(o.src.loop=!1)),o.preMusic=t):t?o.src||o.play():o.pause()}var n=define(),t=base(n),o=sub(n,t),r=n.game,i=n.setting,a=n.files,l=n.store,u=n.playerArr,s=n.enemyArr,c=n.itemArr,m=t.SuperLabel,h=(t.SuperSprite,t.SuperBackground),f=t.SuperScene,g=t.SuperImage,d=t.SuperEntity,p=t.SuperRootScene,w=(o.Aircraft,o.Player),b=(o.Enemy,o.ZakoEnemy),S=o.ZakoEnemy2,x=o.BossEnemyHead,v=o.BossEnemyBody,y=o.BossEnemyHeadRibbon,k=o.BossEnemyBodyRibbon,M=(o.Things,o.Bullet,o.PlayerBullet,o.EnemyBullet,o.EnemyBullet2,o.Item,o.RecoveryItem),C=o.SpeedItem,B=(o.Explosion,o.Cure,function(){var n=r.assets[a.mainSound].clone(),t=r.assets[a.gameOverSound].clone();n.preMusic=l.music,domSoundFlag=!!n.src,new p(r,[new h(i.gameWidth,i.gameHeight,a.title,null,null),new g(291,55,340,420,null,a.startButton,function(){l.currentScene="gamestart"},null,null),new g(87,16,830,10,this.frame=l.music?[2]:[1],a.soundButton,function(){l.music=l.music?!1:!0},function(){this.frame=l.music?[2]:[1]},null)],function(){e(domSoundFlag,n.preMusic,l.music,n,!0),"gamestart"==l.currentScene&&r.pushScene(o()),r.input.space&&r.input.shift&&(l.currentScene="gamestart")});var o=function(){l.startTime=(r.frame/r.fps).toFixed(2),l.playerHitpoint=i.playerHitpoint,l.playerAgility=i.playerAgility,l.gamePoint=0,l.gameTime=0,l.MajiFlag=!1,l.zakoEnemyCounter=0,l.zakoEnemy2Counter=0,l.bossHeadCounter=0,l.bossHeadRibonCounter=0,l.bossBodyCounter=0,l.bossBodyRibonCounter=0;var o=1,p={flag:!1,results:!1},B=new f(i.gameWidth,i.gameHeight,null,[new h(i.gameWidth,i.gameHeight,a.background,function(){this.x-=3,this.x<=-i.gameWidth&&(this.x=i.gameWidth-10)},null),new h(i.gameWidth,i.gameHeight,a.background,function(){this.x-=3,this.x<=-i.gameWidth&&(this.x=i.gameWidth-10)},function(){this.x=i.gameWidth}),new m(10,10,null,null,"#e84b5f",i.labelFontSize,null,function(){l.gameTime=(r.frame/r.fps-l.startTime).toFixed(2),this.text="Time: "+(120-l.gameTime)}),new m(150,10,null,null,"#ffea00",i.labelFontSize,null,function(){this.text="HP: "+l.playerHitpoint+","}),new m(220,10,null,null,"#d1e3ff",i.labelFontSize,null,function(){this.text="Speed: "+l.playerAgility+","}),new m(340,10,null,null,"#fff",i.labelFontSize,null,function(){this.text="Score: "+l.gamePoint}),new g(87,16,830,10,this.frame=l.music?[2]:[1],a.soundButton,function(){l.music=l.music?!1:!0},function(){this.frame=l.music?[2]:[1]},null)],function(){if(e(domSoundFlag,n.preMusic,l.music,n,!0),l.gameTime>1&&l.gameTime<30&&(r.frame%15==0&&new b(i.gameWidth-Math.floor(10*Math.random()+20),Math.floor(Math.random()*(i.gameHeight-0)+0),r.frame+Math.floor(1e4*Math.random()+0),B).saveStore(s),r.frame%100==0&&new M(i.gameWidth-30,Math.floor(Math.random()*(i.gameHeight-0)+0),B),r.frame%120==0&&new C(i.gameWidth-30,Math.floor(Math.random()*(i.gameHeight-0)+0),B)),l.gameTime>5&&l.gameTime<30&&r.frame%25==0&&new S(i.gameWidth-Math.floor(10*Math.random()+20),Math.floor(Math.random()*(i.gameHeight-0)+0),r.frame,B).saveStore(s),l.gameTime>=30&&l.gameTime<120&&1==o&&(new v(500,220,r.frame+Math.floor(1e4*Math.random()+0),B).saveStore(s),new x(515,150,r.frame+Math.floor(1e4*Math.random()+0),B).saveStore(s),new y(515,120,r.frame+Math.floor(1e4*Math.random()+0),B).saveStore(s),new k(540,240,r.frame+Math.floor(1e4*Math.random()+0),B).saveStore(s),o=0),l.gameTime>120&&(l.currentScene="gameover"),1==l.bossHeadCounter&&1==l.bossHeadRibonCounter&&1==l.bossBodyCounter&&1==l.bossBodyRibonCounter&&(l.currentScene="gameclear"),"gameover"==l.currentScene||"gameclear"==l.currentScene){l.music&&(n.stop(),t.play());var h=new f(i.gameWidth,i.gameHeight,"gameover"==l.currentScene?"black":"white",[new m(360,100,500,500,"gameover"==l.currentScene?"white":"black","40px cursive new","gameover"==l.currentScene?"GAME OVER":"GAME CLEAR",null),new m(215,200,300,100,"gameover"==l.currentScene?"white":"black","25px cursive new","",null,null,function(){this.text+=l.zakoEnemyCounter+"体"}),new m(215,250,300,100,"gameover"==l.currentScene?"white":"black","25px cursive new","",null,null,function(){this.text+=l.zakoEnemy2Counter+"体"}),new m(215,300,300,100,"gameover"==l.currentScene?"white":"black","25px cursive new","",null,null,function(){this.text+=l.bossHeadRibonCounter+"体 <br>"}),new m(215,350,300,100,"gameover"==l.currentScene?"white":"black","25px cursive new","",null,null,function(){this.text+=l.bossBodyRibonCounter+"体"}),new m(385,200,300,100,"gameover"==l.currentScene?"white":"black","25px cursive new","",null,null,function(){this.text+=l.bossHeadCounter+"体<br>"}),new m(385,270,300,100,"gameover"==l.currentScene?"white":"black","25px cursive new","",null,null,function(){this.text+=l.bossBodyCounter+"体<br>"}),new m(200,430,300,100,"gameover"==l.currentScene?"white":"black","35px cursive new","",null,null,function(){this.text="Score: "+l.gamePoint+" pt."}),new g(98,32,680,305,null,a.submitButton,function(){if(!p.flag){var e=$("#textBox").val();if(this.text="送信中です",!e)return this.text="名前を入力してください";window.callbacker=function(e){p.results=e,p.flag=!0};var n="function"==typeof window.__404_picomon_solt__?__404_picomon_solt__():"",t=document.createElement("script");t.src="https://www.picomon.jp/game/set_score?data="+Base64.encodeURI(n+Base64.encodeURI(JSON.stringify({callback:"callbacker",type:"shooting_code_404",score:0==l.gamePoint?1:l.gamePoint,nickname:encodeURIComponent(e)})));var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(t,o);var r=this;t.onload=function(){o.parentNode.removeChild(t),r.text=0==p.results.error?"送信が完了しました<br>因みに"+p.results.rank+"位です。":"送信に失敗しました<br>Error Code:"+p.results.err_msg,p.flag=!0}}},function(){p.flag&&h.removeChild(this)},null),new m(530,210,300,100,"gameover"==l.currentScene?"white":"black","18px cursive new","",null,null,function(){this.text="名前を入力して送信ボタンを押すと<br>",this.text+="ランキングに登録することができます"}),new m(580,300,300,100,"gameover"==l.currentScene?"white":"black","18px cursive new"," ",function(){p.flag&&(this.text=0==p.results.error?"送信が完了しました<br>因みに"+p.results.rank+"位です。":"送信に失敗しました<br>Error Code:"+p.results.err_msg)},null,null),new d(120,30,530,305,document.createElement("input"),"text","text","textBox",function(){p.flag&&h.removeChild(this)}),new m(390,520,300,100,"gameover"==l.currentScene?"white":"black","40px cursive new","Continue?",null,function(){r.popScene(B),r.popScene(h),l.currentScene="",n.preMusic=!1}),new g(32,32,570,400,null,a.twitter,function(){window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent("ピコもん 404ゲームで")+l.gamePoint+encodeURIComponent("スコアを獲得した！ ")+location.href+"&url=&original_referer=&hashtags="+encodeURIComponent("404ゲーム")+"&related=code1616","twitter-share-dialog","width=626,height=436")},null,null),new g(32,32,630,400,null,a.facebook,function(){window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(location.href),"facebook-share-dialog","width=626,height=436")},null,null),new g(32,32,690,400,null,a.ranking,function(){window.open(location.origin+location.pathname.split("/").reverse().slice(1).reverse().join("/")+"/popup.html","ranking-dialog","width=313,height=400")},null,null),new g(87,16,830,10,this.frame=l.music?[2]:[1],a.soundButton,function(){l.music=l.music?!1:!0},function(){this.frame=l.music?[2]:[1]},null),new g(32,32,170,200,[4],a.shooter,null,null,null),new g(32,32,170,250,[6],a.shooter,null,null,null),new g(78,56,150,290,null,a.head_r,null,null,function(){this.scale(.5,.5)}),new g(40,31,170,355,null,a.body_r,null,null,function(){this.scale(.5,.5)}),new g(194,246,235,185,null,a.body,null,null,function(){this.scale(.5,.5)}),new g(144,166,255,160,null,a.head,null,null,function(){this.scale(.5,.5)})],function(){r.input.space&&r.input.shift&&(n.preMusic=!1,r.popScene(B),r.popScene(h),l.currentScene="")},null,function(){this._element.style.opacity=.8});r.pushScene(h);for(key in s)delete s[key];for(key in u)delete u[key];for(key in c)delete c[key]}}),E=new w(0,i.gameHeight/2,r.frame+Math.floor(1e4*Math.random()+0),B);return E.saveStore(u),B}});r.onload=B,r.start();var E=window.navigator.userAgent.toLowerCase(),H=window.navigator.appVersion.toLowerCase(),_=function(){return-1!=E.indexOf("opr")?"opera":-1!=E.indexOf("msie")?-1!=H.indexOf("msie 6.")?"ie6":-1!=H.indexOf("msie 7.")?"ie7":-1!=H.indexOf("msie 8.")?"ie8":-1!=H.indexOf("msie 9.")?"ie9":"ie":-1!=E.indexOf("chrome")?"chrome":-1!=E.indexOf("safari")?"safari":-1!=E.indexOf("gecko")?"gecko":!1}();("ie7"==_||"ie6"==_||"ie8"==_||"opera"==_)&&(r.stop(),$(function(){$("#enchant-stage").remove(),$(".ie_alert").show().css("text-aline","center")}))});
