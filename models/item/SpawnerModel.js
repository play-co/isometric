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
import .StaticModel as StaticModel;
import .DynamicModel as DynamicModel;

exports = Class(StaticModel, function (supr) {
	this.init = function (opts) {
		this._pathCount = opts.width * 2 + opts.height * 2;
		this._validPath = {};
		this._validPathKeys = [];

		this._modelInfo = opts.modelInfo || [];
		this._modelInfoCount = [];
		this._modelInfoTotal = 0;
		for (var i = 0; i < this._modelInfo.length; i++) {
			this._modelInfoCount[i] = this._modelInfo[i].count;
			this._modelInfoTotal += this._modelInfo[i].count;
		}

		this._modelCount = 0;
		this._models = [];

		this._updateDT = 1000;

		this._rect = {x: 0, y: 0, w: 1, h: 1};
		this._conditions = opts.conditions;
		this._spawnInterval = opts.spawnInterval || 1000;

		this._scheduledPath = null;

		supr(this, 'init', arguments);
	};

	this.onModelSleep = function (model) {
		this._modelCount--;
		this._models.push(model);
	};

	this.onUpdateMap = function () {
		this._pathCount && this._findPaths();
	};

	this._addValidPath = function (sourceGridX, sourceGridY, gridX, gridY, tag) {
		var index = gridX + '_' + gridY;
		if (!this._validPath[index]) {
			var map = this._map;
			var mapWidth = map.getWidth();
			var mapHeight = map.getHeight();

			this._validPath[index] = [
				{
					x: (sourceGridX + mapWidth) % mapWidth,
					y: (sourceGridY + mapHeight) % mapHeight
				},
				{
					x: (gridX + mapWidth) % mapWidth,
					y: (gridY + mapHeight) % mapHeight
				},
			];
			this._validPath[index].tag = tag;
			this._validPathKeys = Object.keys(this._validPath);
			this._pathCount--;
		}
	};

	this._tileValid = function (gridX, gridY) {
		this._rect.x = gridX;
		this._rect.y = gridY;

		return this._map.acceptRect(this._rect, this._conditions);
	};

	this._findPaths = function () {
		var width = this._width;
		var height = this._height;
		var x = this._tileX;
		var y = this._tileY;

		for (var i = 0; i < width; i++) {
			var gridX = x + i;
			var gridY = y - 1;

			this._tileValid(gridX, gridY) && this._addValidPath(gridX, gridY + 1, gridX, gridY, 1);

			gridY = y + height;

			this._tileValid(gridX, gridY) && this._addValidPath(gridX, gridY - 1, gridX, gridY, 2);
		}

		for (var i = 0; i < height; i++) {
			var gridX = x - 1;
			var gridY = y + i;

			this._tileValid(gridX, gridY) && this._addValidPath(gridX + 1, gridY, gridX, gridY, 3);

			gridX = x + width;

			this._tileValid(gridX, gridY) && this._addValidPath(gridX - 1, gridY, gridX, gridY, 4);
		}
	};

	this._clonePath = function (path) {
		var clone = [];

		for (var i = 0; i < path.length; i++) {
			clone.push({x: path[i].x, y: path[i].y});
		}

		return clone;
	};

	this._randomInfo = function () {
		var result = null;
		var modelInfo = this._modelInfo;
		var i = modelInfo.length;

		if (!this._modelInfoTotal) {
			return false;
		}

		while (!result) {
			var i = (Math.random() * this._modelInfo.length) | 0;
			if (this._modelInfoCount[i]) {
				this._modelInfoCount[i]--;
				this._modelInfoTotal--;
				return modelInfo[i];
			}
		}

		return false;
	};

	this._pathOpts = function () {
		var index = (Math.random() * this._validPathKeys.length) | 0;
		var path = this._validPath[this._validPathKeys[index]];

		return {
			gridModel: this._gridModel,
			tileX: path[0].x,
			tileY: path[0].y,
			startPath: this._clonePath(path),
			conditions: this._conditions,
			spawner: this
		};
	};

	this.spawnModel = function () {
		var model = null;

		if (this._models.length) {
			model = this._models.pop();
			model.updateOpts(this._pathOpts());
			this.emit('WakeupModel', model);
		} else {
			var modelInfo = this._randomInfo();
			if (!modelInfo) {
				return;
			}
		 	model = new modelInfo.ctor(merge(this._pathOpts(), modelInfo.opts));
			model.on('Sleep', bind(this, 'onModelSleep'));
			this.emit('SpawnedModel', model);
		}

		if (model) {
			if (this._scheduledPath) {
				model.setPath(this._scheduledPath);
				this._scheduledPath = null;
			}
			this._modelCount++;
		}
	};

	this.schedulePath = function (path) {
		var i = path.length - 1;
		while (i) {
			i--;
			path.push({x: path[i].x, y: path[i].y});
		}
		this._scheduledPath = path;
		console.log('schedule:', path);
	};

	this.tick = function (dt) {
		this._updateDT -= dt;
		if (this._updateDT > 0) {
			return;
		}
		this._updateDT = this._spawnInterval + Math.random() * this._spawnInterval;

		if (this._validPathKeys.length && (this._modelCount < 3)) {
			this.spawnModel();
		}
	};

	this.getValidPath = function () {
		return this._validPath;
	};

	this.getValidPathKeys = function () {
		return this._validPathKeys;
	};
});