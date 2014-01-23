(function (window) {

	function Ship() {
		this.initialize();
	}

	var p = Ship.prototype = new createjs.Container();

// public properties:
	Ship.TOGGLE = 60;
	Ship.MAX_THRUST = 2;
	Ship.MAX_VELOCITY = 5;

// public properties:
	p.shipFlame;
	p.shipBody;

	p.timeout;
	p.thrust;

	p.vX;
	p.vY;

	p.bounds;
	p.hit;

// constructor:
	p.Container_initialize = p.initialize;

	p.initialize = function () {
		this.Container_initialize();

		this.shipFlame = new createjs.Bitmap( './img/main.png' );
		this.shipFlame.x = -50;
		this.shipFlame.y = -44;

		this.addChild(this.shipFlame);
		this.bounds = 10;
		this.hit = this.bounds;
		this.timeout = 0;
		this.thrust = 0;
		this.vX = 0;
		this.vY = 0;
	}

	p.tick = function (event) {
		//move by velocity
		this.x += this.vX;
		this.y += this.vY;

		//with thrust flicker a flame every Ship.TOGGLE frames, attenuate thrust
		if (this.thrust > 0) {
			this.timeout++;

			if (this.timeout > Ship.TOGGLE) {
				this.timeout = 0;
			}
			this.thrust -= 0.5;
		} else {
			this.thrust = 0;
		}
	}

	p.accelerate = function () {
		//increase push ammount for acceleration
		this.thrust += this.thrust + 0.6;
		if (this.thrust >= Ship.MAX_THRUST) {
			this.thrust = Ship.MAX_THRUST;
		}

		//accelerate
		this.vX += Math.sin( ( this.rotation + 90 ) * (Math.PI / -180)) * this.thrust;
		this.vY += Math.cos( ( this.rotation + 90 ) * (Math.PI / -180)) * this.thrust;

		//cap max speeds
		this.vX = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vX));
		this.vY = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vY));
	}

	window.Ship = Ship;

}(window));