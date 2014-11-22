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
import .DynamicModel;

exports = Class(DynamicModel, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._rect = {x: 0, y: 0, w: 1, h: 1};
		this._map = this._gridModel.getMap();

		this.updateOpts(opts);
	};

	this.updateOpts = function (opts) {
		supr(this, 'updateOpts', arguments);

		this._opts.visible = false;

		this._needsPath = true;
		this._startPath = opts.startPath || [];
		this._spawner = opts.spawner || this._spawner;
		this._conditions = opts.conditions || this._conditions;
		this._maxPathLength = opts.maxPathLength || this._maxPathLength || 20;
	};

	this._tileValid = function (tileX, tileY) {
		this._rect.x = tileX;
		this._rect.y = tileY;
		return this._map.acceptRect(this._rect, this._conditions);
	};

	this._findPath = function () {
		var opts = this._opts;

		var map = this._map;
		var mapWidth = map.getWidth();
		var mapHeight = map.getHeight();

		var options = [{tileX: -1, tileY: 0}, {tileX: 1, tileY: 0}, {tileX: 0, tileY: -1}, {tileX: 0, tileY: 1}];
		var direction = null;
		var directionTest = 0;
		var denyDirection = null;

		var path = this._startPath;
		var startX = path[path.length - 1].tileX;
		var startY = path[path.length - 1].tileY;
		var tileX = startX;
		var tileY = startY;

		var addPoint = function () {
				tileX = (tileX + mapWidth + direction.tileX) % mapWidth;
				tileY = (tileY + mapHeight + direction.tileY) % mapHeight;
				path.push({tileX: tileX, tileY: tileY});
			};

		while (path.length < this._maxPathLength) {
			var directionsTested = 0;
			directionTest++;
			while ((direction === null) && (directionsTested < 4)) {
				var option = options[(Math.random() * 4) | 0];
				if (option.directionTest !== directionTest) {
					directionsTested++;
					option.directionTest = directionTest;
					if (this._tileValid(tileX + option.tileX, tileY + option.tileY)) {
						if (denyDirection && (denyDirection.tileX === option.tileX) && (denyDirection.tileY === option.tileY)) {
						} else {
							direction = option;
						}
					}
				}
			}

			if (!direction) {
				break;
			}

			if (this._tileValid(tileX + direction.tileX, tileY + direction.tileY)) {
				var tile = map.getTile(tileX + direction.tileX, tileY + direction.tileY)[1];
				if (!((tile.index === 56) || (tile.index === 146))) {
					addPoint();
					denyDirection = {tileX: direction.tileX ? -direction.tileX : 0, tileY: direction.tileY ? -direction.tileY : 0};
					direction = null;
				}
				if (direction) {
					addPoint();
					if ((startX === tileX) && (startY === tileY)) {
						break;
					}
				}
			} else {
				direction = null;
			}
		}

		if ((startX !== tileX) || (startY !== tileY)) {
			var i = path.length - 1;
			while (i) {
				i--;
				path.push({tileX: path[i].tileX, tileY: path[i].tileY});
			}
		}
		if (path.length > 2) {
			this.setPath(path);
		}
	};

	this.tick = function (dt) {
		var result = supr(this, 'tick', arguments);

		if (result !== DynamicModel.tickResult.CONTINUE) {
			return result;
		}

		var opts = this._opts;

		if (this._needsPath) {
			this._findPath();
			this._needsPath = false;
		}

		if (!this._path) {
			opts.visible = false;
			opts.dt = dt;
			this._updateCB && this._updateCB(opts);
			this._sleepCB && this._sleepCB(this);

			return DynamicModel.tickResult.SLEEP;
		}

		var tile = this._path[0];
		opts.visible = !((opts.tileX === tile.tileX) && (opts.tileY === tile.tileY));

		return result;
	};

	this.setPath = function (path) {
		supr(this, 'setPath', arguments);

		this._needsPath = false;
	};

	this.getSpawner = function () {
		return this._spawner;
	};
});