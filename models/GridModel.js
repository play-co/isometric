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
import lib.Enum as Enum;

import .map.Map as Map;
import .map.MapGenerator as MapGenerator;
import .map.AStar as AStar;

import .StaticModels;

var selectModes = Enum(
		'AREA',
		'LINE',
		'FIXED'
	);

exports = Class(function () {
	this.init = function (opts) {
		if (!opts.gridSettings.width) {
			opts.gridSettings.width = 64;
		}
		if (!opts.gridSettings.height) {
			opts.gridSettings.height = 64;
		}

		var data = merge(
				opts.gridSettings,
				{
					x: 0,
					y: 0,

					tileWidth: 150,
					tileHeight: ~~(150 * 0.8),
					tileX: 0,
					tileY: 0,

					width: opts.gridSettings.width,
					height: opts.gridSettings.height,

					selection: null,

					underDrawX: 1,
					underDrawY: 1,

					layers: [
						{
							blockEvents: true,
							dynamicViews: 0
						},
						{
							blockEvents: false,
							dynamicViews: 30
						}
					]
				}
			);

		if (opts.editorSettings) {
			for (var i in opts.editorSettings) {
				var editorSetting = opts.editorSettings[i];
				opts.editorSettings[i] = merge(
					editorSetting,
					{
						index: 0,
						width: 1,
						height: 1
					}
				);
			}
		}

		data.map = new Map({
			mapSettings: opts.mapSettings,
			editorSettings: opts.editorSettings || {},
			width: data.width,
			height: data.height,
			layers: data.layers,
			itemOwner: this
		});
		data.grid = data.map.getGrid();

		this._mapGenerator = new MapGenerator({
			gridModel: this,
			settings: opts.mapSettings,
			map: data.map
		});
		this._mapGenerator.on('Ready', bind(this, 'onMapReady'));

		this._staticModels = new StaticModels({
			gridModel: this,
			map: data.map
		});

		this._ready = true;
		this._lockHorizontal = -1;
		this._selectMode = selectModes.AREA;
		this._aStar = new AStar({map: data.map});
		this._data = data;

		this._clearCB = null;
		this._updateCB = null;
		this._refreshMapCB = null;
		this._addParticlesCB = null;
		this._clearParticlesCB = null;
		this._selectionChangeCB = null;
		this._readyCB = null;
		this._scrolledCB = null;
		this._progressCB = null;
		this._addModelCB = null;
	};

	this.pointToGrid = function (point) {
		var data = this._data;
		var x;
		var y;

		if (arguments.length === 1) {
			x = point.x;
			y = point.y;
		} else {
			x = arguments[0];
			y = arguments[1];
		}
		x += data.tileWidth * data.underDrawX - data.x;
		y += data.tileHeight * data.underDrawY - data.y;
		return {
			tileX: (data.tileX + data.width - Math.round((y / data.tileHeight) - (x / data.tileWidth))) % data.width,
			tileY: (data.tileY + data.height - 1 + Math.round((y / data.tileHeight) + (x / data.tileWidth))) % data.height
		}
	};

	this.generate = function () {
		this._mapGenerator.generate();
	};

	this.tick = function (dt) {
		if (this._mapGenerator.generateStep()) {
			this._aStar.update();
			this._updateCB && this._updateCB(this._data);
			this._staticModels.tick(dt);

			if (this._ready) {
				this._ready = false;
				this._readyCB();
			}
		} else {
			this._ready = true;
		}
	};

	this.findPath = function (startX, startY, endX, endY, conditions, cb) {
		this._aStar.findPath(startX, startY, endX, endY, conditions, cb);
	};

	this.scrollLeft = function (speed) {
		var data = this._data;
		var didScroll = false;

		data.x += speed;
		while (data.x > data.tileWidth) {
			data.tileX = (data.tileX + data.width - 1) % data.width;
			data.tileY = (data.tileY + data.height - 1) % data.height;
			data.x -= data.tileWidth;
			didScroll = true;
		}

		didScroll && this._scrolledCB && this._scrolledCB();
	};

	this.scrollRight = function (speed) {
		var data = this._data;
		var didScroll = false;

		data.x -= speed;
		while (data.x < 0) {
			data.tileX = (data.tileX + 1) % data.width;
			data.tileY = (data.tileY + 1) % data.height;
			data.x += data.tileWidth;
			didScroll = true;
		}

		didScroll && this._scrolledCB && this._scrolledCB();
	};

	this.scrollUp = function (speed) {
		var data = this._data;
		var didScroll = false;

		data.y += speed;
		while (data.y > data.tileHeight) {
			data.tileX = (data.tileX + 1) % data.width;
			data.tileY = (data.tileY + data.height - 1) % data.height;
			data.y -= data.tileHeight;
			didScroll = true;
		}

		didScroll && this._scrolledCB && this._scrolledCB();
	};

	this.scrollDown = function (speed) {
		var data = this._data;
		var didScroll = false;

		data.y -= speed;
		while (data.y < 0) {
			data.tileX = (data.tileX + data.width - 1) % data.width;
			data.tileY = (data.tileY + 1) % data.height;
			data.y += data.tileHeight;
			didScroll = true;
		}

		didScroll && this._scrolledCB && this._scrolledCB();
	};

	this.scrollBy = function (x, y) {
		(x > 0) ? this.scrollLeft(x) : this.scrollRight(-x);
		(y > 0) ? this.scrollUp(y) : this.scrollDown(-y);
	};

	this.setSelection = function (startPoint, endPoint) {
		var data = this._data;
		var selection = data.selection;

		if (selection) {
			selection.startPoint = startPoint;
			selection.endPoint = endPoint;
		} else if (!startPoint || !endPoint) {
			data.selection = null;
			return;
		} else {
			selection = {
				startPoint: startPoint,
				endPoint: endPoint,
				firstPoint: {tileX: startPoint.tileX, tileY: startPoint.tileY}
			};
			data.selection = selection;
		}

		if (this._selectMode === selectModes.FIXED) {
			selection.startPoint = selection.endPoint;
			selection.endPoint = {
				tileX: selection.startPoint.tileX + this._fixedWidth - 1,
				tileY: selection.startPoint.tileY + this._fixedHeight - 1
			};
		} else if (this._selectMode === selectModes.LINE) {
			var firstPoint = selection.firstPoint;

			if ((firstPoint.tileX === endPoint.tileX) && (firstPoint.tileY === endPoint.tileY)) {
				this._lockHorizontal = -1;
			} else if (this._lockHorizontal === -1) {
				if (selection.startPoint.tileX !== selection.endPoint.tileX) {
					this._lockHorizontal = 1;
				} else if (selection.startPoint.tileY !== selection.endPoint.tileY) {
					this._lockHorizontal = 2;
				}
			} else {
				if (this._lockHorizontal === 1) {
					if ((firstPoint.tileX === endPoint.tileX) && (firstPoint.tileY !== endPoint.tileY)) {
						this._lockHorizontal = 2;
					}
				} else if (this._lockHorizontal === 2) {
					if ((firstPoint.tileY === endPoint.tileY) && (firstPoint.tileX !== endPoint.tileX)) {
						this._lockHorizontal = 1;
					}
				}
			}

			switch (this._lockHorizontal) {
				case 1:
					selection.startPoint.tileY = selection.firstPoint.tileY;
					selection.endPoint.tileY = selection.firstPoint.tileY;
					break;
				case 2:
					selection.startPoint.tileX = selection.firstPoint.tileX;
					selection.endPoint.tileX = selection.firstPoint.tileX;
					break;
			}
		}

		this._selectionChangeCB && this._selectionChangeCB(selection);
	};

	this.getRect = function (point1, point2) {
		var data = this._data;
		var x1 = Math.min(point1.tileX, point2.tileX);
		var x2 = Math.max(point1.tileX, point2.tileX);
		var y1 = Math.min(point1.tileY, point2.tileY);
		var y2 = Math.max(point1.tileY, point2.tileY);
		var rect = {x: x1, y: y1};

		if (x2 - x1 > data.width * 0.5) {
			var n = x1 + data.width;
			x1 = x2;
			x2 = n;
			rect.x = x1;
		}
		if (y2 - y1 > data.height * 0.5) {
			var n = y1 + data.height;
			y1 = y2;
			y2 = n;
			rect.y = y1;
		}

		rect.w = x2 - x1 + 1;
		rect.h = y2 - y1 + 1;

		return rect;
	};

	this.getMap = function () {
		return this._data.map;
	};

	this.getSelection = function () {
		return this._data.selection;
	};

	this.setSelectMode = function (selectMode) {
		this._lockHorizontal = -1;
		this._selectMode = selectMode;
	};

	this.setFixedWidth = function (fixedWidth) {
		this._fixedWidth = fixedWidth;
	};

	this.setFixedHeight = function (fixedHeight) {
		this._fixedHeight = fixedHeight;
	};

	this.getWidth = function () {
		return this._data.width;
	};

	this.getHeight = function () {
		return this._data.height;
	};

	this.getStaticModels = function () {
		return this._staticModels;
	};

	this.getTileX = function () {
		return this._data.tileX;
	};

	this.getTileY = function () {
		return this._data.tileY;
	};

	this.getX = function () {
		return this._data.x;
	};

	this.getY = function () {
		return this._data.y;
	};

	this.setClearCB = function (clearCB) {
		this._clearCB = clearCB;
	};

	this.setUpdateCB = function (updateCB) {
		this._updateCB = updateCB;
	};

	this.getRefreshMapCB = function () {
		return this._refreshMapCB;
	};

	this.setRefreshMapCB = function (refreshMapCB) {
		this._refreshMapCB = refreshMapCB;
	};

	this.setAddParticlesCB = function (addParticlesCB) {
		this._addParticlesCB = addParticlesCB;
	};

	this.setClearParticlesCB = function (clearParticlesCB) {
		this._clearParticlesCB = clearParticlesCB;
	};

	this.setSelectionChangeCB = function (selectionChangeCB) {
		this._selectionChangeCB = selectionChangeCB;
	};

	this.setReadyCB = function (readyCB) {
		this._readyCB = readyCB;
	};

	this.setScrolledCB = function (scrolledCB) {
		this._scrolledCB = scrolledCB;
	};

	this.getProgressCB = function () {
		return this._progressCB;
	};

	this.setProgressCB = function (progressCB) {
		this._progressCB = progressCB;
	};

	this.getAddModelCB = function () {
		return this._addModelCB;
	};

	this.setAddModelCB = function (addModelCB) {
		this._addModelCB = addModelCB;
	};

	this.clearSelection = function () {
		this._lockHorizontal = -1;
		this._data.selection = null;
	};

	this.onMapReady = function () {
		this._refreshMapCB && this._refreshMapCB();
	};

	this.addParticles = function (type, tileX, tileY, x, y, clearSystem) {
		if (this._addParticlesCB) {
			return this._addParticlesCB(type, tileX, tileY, x, y, clearSystem);
		}
		return false;
	};

	this.clearParticles = function (tileX, tileY) {
		this._clearParticlesCB && this._clearParticlesCB(tileX, tileY);
	};

	this.clear = function () {
		this._data.map.clear();
		this._staticModels.clear();

		var data = this._data;

		data.x = 0;
		data.y = 0;

		data.tileX = 0;
		data.tileY = 0;

		data.selection = null;

		this._clearCB && this._clearCB();
	};

	this.generate = function () {
		this._mapGenerator.generate();
	};

	this.toJSON = function () {
		var data = this._data;

		return {
			grid: {
				tileX: data.tileX,
				tileY: data.tileY,
				x: data.x,
				y: data.y
			},
			map: this._data.map.toJSON(),
			staticModels: this._staticModels.toJSON()
		};
	};

	this.fromJSON = function (data) {
		this.clear();
		this._mapGenerator.setDone(true);

		this._data.map.fromJSON(data.map);

		this._data.grid = this._data.map.getGrid();
		this._data.tileX = data.grid.tileX;
		this._data.tileY = data.grid.tileY;
		this._data.x = data.grid.x;
		this._data.y = data.grid.y;

		this._staticModels.fromJSON(data.staticModels);
	};
});

exports.selectModes = selectModes;