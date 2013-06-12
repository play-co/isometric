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
import ui.ImageView as ImageView;

import .item.ItemView as ItemView;

import .ViewPool;
import .ParticleSystemView;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		var tileViews = opts.tileViews;
		var maxCountX = opts.maxCountX;
		var maxCountY = opts.maxCountY;
		var layerIndex = opts.index;

		opts = merge(
			opts,
			{
				x: 0,
				y: 0,
				width: maxCountX * opts.tileWidth,
				height: maxCountY * opts.tileHeight,
				blockEvents: true
			}
		);
		supr(this, 'init', [opts]);

		if (opts.dynamicViews) {
			this.viewPool = new ViewPool({
				initCount: opts.dynamicViews,
				ctor: ItemView,
				initOpts: {
					superview: this,
					itemSettings: opts.itemSettings || {},
					particleSettings: opts.particleSettings || {}
				}
			});
		}

		if (opts.particleSystems) {
			this.particleSystems = new ViewPool({
				initCount: opts.dynamicViews,
				ctor: ParticleSystemView,
				initOpts: {
					superview: this,
					particleSettings: opts.particleSettings || {},
					particleSystemsCB: bind(this, function () { return this.particleSystems; }),
					particleSystemSize: opts.particleSystemSize,
					tileWidth: opts.tileWidth,
					tileHeight: opts.tileHeight
				}
			});
		}

		for (y = 0; y < maxCountY; y++) {
			if (!tileViews[y]) {
				tileViews[y] = [];
			}

			var ox = (y & 1) * opts.tileWidth * 0.5;
			var line = [];

			for (x = 0; x < maxCountX; x++) {
				if (!tileViews[y][x]) {
					tileViews[y][x] = [];
				}
				var view = new ImageView({
						superview: this,
						x: ox + x * opts.tileWidth,
						y: y * opts.tileHeight * 0.5,
						zIndex: (y * maxCountX + x) * 100,
						width: opts.tileWidth,
						height: opts.tileHeight,
						visible: false
					});

				tileViews[y][x][layerIndex] = view;

				view.startX = view.style.x;
				view.startY = view.style.y;
				view.startZ = (y * maxCountX + x) * 100;
				view.left = ox + x * opts.tileWidth;
				view.bottom = y * opts.tileHeight * 0.5 + opts.tileHeight;
			}
		}
	};
});