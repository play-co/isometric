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
import .TileGroup;

exports = Class(function () {
	this.init = function (opts) {
		this._groups = {};

		var tileSettings = opts.tileSettings;
		var i = tileSettings.length;
		while (i) {
			var tileSetting = tileSettings[--i];
			this.addGroup(tileSetting.group, tileSetting);
		}
	};

	this.addGroup = function (group, opts) {
		this._groups[group] = new TileGroup(opts);
	};

	this.getImage = function (tile) {
		var group = this._groups[tile.group];
		if (group) {
			return group.getImage(tile);
		}
		return false;
	};

	this.setImage = function (tileView, tile) {
		var group = this._groups[tile.group];
		if (group) {
			return group.setImage(tileView, tile);
		}
		return false;
	};
});