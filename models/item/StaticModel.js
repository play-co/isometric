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

		this._modelType = opts.modelType;

		this._x = opts.x;
		this._y = opts.y;
		this._width = opts.width;
		this._height = opts.height;

		this._gridModel = opts.gridModel;
		this._map = this._gridModel.getMap();

		this._layer = opts.layer;
		this._group = opts.group;
		this._index = opts.index;

		this._surrounding = opts.surrounding;

		this.onUpdateMap();
	};

	this.getModelType = function () {
		return this._modelType;
	};

	this.getX = function () {
		return this._x;
	};

	this.getY = function () {
		return this._y;
	};

	this.getGroup = function () {
		return this._group;
	};

	this.getIndex = function () {
		return this._index;
	};

	/**
	 * This function is called when a tile next to the item changes.
	 */
	this.onUpdateMap = function () {
	};

	this.tick = function (dt) {
	};
});