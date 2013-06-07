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
		this._particleSystem.clear();
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

	this.clear = function () {
		this._particleSystem.clear();
	};
});