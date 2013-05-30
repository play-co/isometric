import ui.ImageView as ImageView;

import ui.resource.Image as Image;

import shooter.particle.ParticleSystem as ParticleSystem;

exports = Class(ImageView, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				width: 16,
				height: 40
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

		this._itemSetting = {offsetX: 0, offsetY: 0};
		this._itemSettings = opts.itemSettings;
		this._images = null;
		this._lastImageIndex = 0;
	};

	this.create = function (opts, tileOnScreen) {
		this.style.visible = false;
		this._item = opts.item;
	};

	this.onUpdate = function (opts) {
		var itemSetting = this._itemSettings[this._item];

		if (itemSetting) {
			this._itemSetting = itemSetting;

			this.style.width = itemSetting.width;
			this.style.height = itemSetting.height;

			if (itemSetting.images) {
				if (!this._images) {
					this._images = [];
					for (var i = 0; i < itemSetting.images.length; i++) {
						this._images.push(new Image({url: itemSetting.images[i]}));
					}
					this.setImage(this._images[0]);
				}
				if (opts.imageIndex !== this._lastImageIndex) {
					this._lastImageIndex = opts.imageIndex || 0;
					this.setImage(this._images[this._lastImageIndex]);
				}
				this.style.flipX = opts.flipX;
				this.style.flipY = opts.flipY;
			} else if (itemSetting.color) {
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
		this.style.x = tileOnScreen.x + this._itemSetting.offsetX;
		this.style.y = tileOnScreen.y + this._itemSetting.offsetY;
		this.style.zIndex = tileOnScreen.z;
	};
});