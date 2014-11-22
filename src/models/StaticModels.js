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
import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._map = opts.map;
		this._gridModel = opts.gridModel;
		this._list = [];
	};

	this.findStaticModelByGroup = function (group, x, y, exclude) {
		var result = null;
		var map = this._gridModel.getMap();
		var mapWidth = map.getWidth() - 1;
		var mapHeight = map.getHeight() - 1;
		var min = Math.min;
		var max = Math.max;
		var minDistance = 9999999999;
		var list = this._list;
		var i = list.length;

		while (i) {
			var staticModel = list[--i];
			if ((staticModel !== exclude) && (staticModel.getGroup() === group)) {
				var modelX = staticModel.getTileX();
				var modelY = staticModel.getTileY();
				var minX = min(x, modelX);
				var maxX = max(x, modelX);
				var minY = min(y, modelY);
				var maxY = max(y, modelY);
				var deltaX = min(mapWidth - maxX + minX, maxX - minX);
				var deltaY = min(mapHeight - maxY + minY, maxY - minY);
				var manhattan = deltaX + deltaY;

				if (manhattan < minDistance) {
					minDistance = manhattan;
					result = staticModel;
				}
			}
		}

		return result;
	};

	this.add = function (staticModel) {
		this._list.push(staticModel);
	};

	this.tick = function (dt) {
		var list = this._list;
		var i = list.length;

		while (i) {
			list[--i].tick(dt);
		}
	};

	this.getList = function () {
		return this._list;
	};

	this.getModelsByType = function () {
		var modelByType = {};
		var list = this._list;
		var i = list.length;

		while (i) {
			var item = list[--i];
			if (item.getModelType) {
				var modelType = item.getModelType();
				if (!modelByType[modelType]) {
					modelByType[modelType] = [];
				}
				modelByType[modelType].push(item);
			}
		}

		return modelByType;
	};

	this.clear = function () {
		this._list = [];
	};

	this.toJSON = function () {
		var result = [];
		var list = this._list;
		var i = list.length;

		while (i) {
			result.push(list[--i].toJSON());
		}

		return result;
	};

	this.fromJSON = function (data) {
		var map = this._map;
		var i = data.length;
		while (i) {
			item = data[--i];
			var model = map.putItem(item.modelType, item.tileX, item.tileY, item);
			if (model) {
				this._gridModel.getAddModelCB()(model);
				this._list.push(model);
			}
		}
	};
});