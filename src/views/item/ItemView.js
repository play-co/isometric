/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */
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
				types: opts.particleSettings || {}
			});
		}

		this._itemSetting = {offsetX: 0, offsetY: 0};
		this._itemSettings = opts.itemSettings || {};
		this._lastImageIndex = 0;
		this._zIndex = 0;
	};

	this.create = function (opts, tileOnScreen) {
		this.style.visible = false;
	};

	this.onUpdate = function (opts) {
		var itemSetting = this._itemSettings[opts.item];

		this._zIndex = opts.zIndex || 0;

		if (itemSetting) {
			this._itemSetting = itemSetting;

			this.style.width = itemSetting.width;
			this.style.height = itemSetting.height;

			if (itemSetting.images) {
				var loadedImages = itemSetting.loadedImages;
				if (!loadedImages) {
					loadedImages = [];
					for (var i = 0; i < itemSetting.images.length; i++) {
						loadedImages.push(new Image({url: itemSetting.images[i]}));
					}
					this.setImage(loadedImages[0]);
					itemSetting.loadedImages = loadedImages;
				}

				if (opts.imageIndex !== this._lastImageIndex) {
					this._lastImageIndex = opts.imageIndex || 0;
					this.setImage(loadedImages[this._lastImageIndex]);
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
			if (i) {
				if (particles[0].clear) {
					particleSystem.clear();
				}
				while (i) {
					var particle = particles[--i];
					particleSystem.activateType(particle.type);
					particleSystem.addParticles({x: particle.x || 0, y: particle.y || 0});
				}
			}
		}

		particleSystem.tick(opts.dt);
	};

	this.setTileOnScreen = function (opts, tileOnScreen) {
		this.style.x = tileOnScreen.x + this._itemSetting.offsetX;
		this.style.y = tileOnScreen.y + this._itemSetting.offsetY;
		this.style.zIndex = tileOnScreen.z + this._zIndex;
	};
});