import ui.View as View;

import shooter.particle.ParticleSystem as ParticleSystem;

var ParticleSystemLength = Class(ParticleSystem, function (supr) {
	this.getLength = function () {
		return this._freshViewIndex;
	};
});

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				blockEvents: true
			}
		);
		supr(this, 'init', arguments);

		this._particleSystem = new ParticleSystemLength({
			superview: this,
			initCount: opts.particleSystemSize,
			types: opts.particleSettings
		});

		this.style.width = opts.tileWidth;
		this.style.height = opts.tileHeight;

		this._centerX = opts.tileWidth * 0.5;
		this._centerY = opts.tileHeight * 0.5;

		this._particleSystemsCB = opts.particleSystemsCB;
	};

	this.release = function () {
		this._particleSystemsCB().releaseView(this);
	};

	this.update = function (dt) {
		this._particleSystem.tick(dt);

		if (!this._particleSystem.getLength()) {
			this.style.visible = false;
			this.release();
		}
	};

	this.addParticle = function (type, x, y) {
		var particleSystem = this._particleSystem;

		particleSystem.activateType(type);
		particleSystem.addParticles({x: this._centerX + (x || 0), y: this._centerY + (y || 0)});

		this.style.visible = true;
	};
});