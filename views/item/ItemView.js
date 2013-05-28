import ui.View as View;

import shooter.particle.ParticleSystem as ParticleSystem;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				width: 16,
				height: 40,
				backgroundColor: 'red'
			}
		);

		supr(this, 'init', [opts]);

		if (opts.particleSettings) {
			this._particleSystem = new ParticleSystem({
				superview: this,
				initCount: 10,
				types: opts.particleSettings
			});
		}

		this._itemSettings = opts.itemSettings;
	};

	this.create = function (opts, tileOnScreen) {
		this.style.visible = false;
		this._item = opts.item;
	};

	this.onUpdate = function (opts) {
		var itemSetting = this._itemSettings[this._item];

		if (itemSetting) {
			if (itemSetting.color) {
				this.style.backgroundColor = itemSetting.color;
			}
		}
		this.style.visible = opts.visible;

		var particleSystem = this._particleSystem;
		var particles = opts.particles;
		if (particles) {
			var i = particles.length;
			while (i) {
				var particle = particles[--i];
				particleSystem.activateType(particle.type);
				particleSystem.addParticles({x: particle.x || 0, y: particle.y || 0});
			}
		}

		particleSystem.tick(opts.dt);
	};

	this.setTileOnScreen = function (opts, tileOnScreen) {
		this.style.x = tileOnScreen.x - 8;
		this.style.y = tileOnScreen.y - 40;
		this.style.zIndex = tileOnScreen.z;
	};
});