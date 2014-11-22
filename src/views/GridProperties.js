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
import .tiles.TileGroups as TileGroups;

exports = Class(function () {
	this.initProperties = function (opts) {
		this._minScale = opts.minScale || 0.6;
		this._maxScale = opts.maxScale || 2;

		this._grid = null;
		this._tileX = null;
		this._tileY = null;
		this._width = null;
		this._height = null;

		this._gridSettings = merge(
			opts.gridSettings,
			{
				underDrawX: 2,
				underDrawY: 2,
				overDrawX: 2,
				overDrawY: 3
			}
		);

		this._tileWidth = this._gridSettings.tileWidth;
		this._tileHeight = this._gridSettings.tileHeight;
		this._itemSettings = opts.itemSettings || {};
		this._particleSettings = opts.particleSettings || {};

		this._deltaX = this._tileWidth * 0.5;
		this._deltaY = this._tileHeight * 0.5;

		this._needsBuild = true;

		this._tileGroups = new TileGroups(opts);

		this._sizes = {};
		for (var i = 0; i < opts.tileSettings.length; i++) {
			var tileSetting = merge(
					opts.tileSettings[i],
					{
						width: 1,
						height: 1,
						index: 0,
						x: 0,
						y: 0,
						z: [0, 0]
					}
				);

			this._sizes[tileSetting.group] = tileSetting;
		}
	};

	this._buildViewProperties = function (data) {
		this._underDrawX = data.underDrawX || 2;
		this._underDrawY = data.underDrawY || 2;
		this._overDrawX = data.overDrawX || 2;
		this._overDrawY = data.overDrawY || 3;

		this._grid = data.grid;
		this._width = data.width;
		this._height = data.height;		

		if (this.style) {
			var overDrawX = data.underDrawX + data.overDrawX;
			var overDrawY = data.underDrawY + data.overDrawY;

			this._maxCountX = (this.style.width / (this._tileWidth * this._minScale) + overDrawX) | 0;
			this._maxCountY = (this.style.height / (this._tileHeight * this._minScale) * 2 + overDrawY) | 0;

			this._countX = (this.style.width / (this._tileWidth * this.style.scale) + overDrawX) | 0;
			this._countY = (this.style.height / (this._tileHeight * this.style.scale) * 2 + overDrawY) | 0;
		}

		this._needsBuild = false;
	};

	this.getProperties = function () {
		return {
			tileWidth: this._tileWidth,
			tileHeight: this._tileHeight,
			maxCountX: this._maxCountX,
			maxCountY: this._maxCountY,
			countX: this._countX,
			countY: this._countY,
			gridSettings: this._gridSettings,
			itemSettings: this._itemSettings,
			particleSettings: this._particleSettings
		};
	};

	this.getTileWidth = function () {
		return this._tileWidth;
	};

	this.getTileHeight = function () {
		return this._tileHeight;
	};

	this.getCountX = function () {
		return this._countX;
	};

	this.getCountY = function () {
		return this._countY;
	};
});