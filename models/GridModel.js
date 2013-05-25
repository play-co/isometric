import lib.Enum as Enum;

import event.Emitter as Emitter;

import .map.Map as Map;
import .map.MapGenerator as MapGenerator;
import .map.AStar as AStar;

var selectModes = Enum(
		'AREA',
		'LINE',
		'FIXED'
	);

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		var data = merge(
				opts.gridSettings,
				{
					offsetX: 0,
					offsetY: 0,

					tileWidth: 150,
					tileHeight: ~~(150 * 0.8),

					gridX: 0,
					gridY: 0,
					gridWidth: 64,
					gridHeight: 64,

					cursor: false,
					selection: null,

					layers: 2
				}
			);

		data.map = new Map({
			settings: opts.mapSettings,
			width: data.gridWidth,
			height: data.gridHeight,
			layers: data.layers
		});
		data.grid = data.map.getGrid();

		this._mapGenerator = new MapGenerator({
			model: this,
			settings: opts.mapSettings,
			map: data.map
		});
		this._mapGenerator.on('Ready', bind(this, 'onMapReady'));
		this._mapGenerator.generate();

		this._lockHorizontal = -1;
		this._selectMode = selectModes.AREA;

		this._aStar = new AStar({map: data.map});

		this._data = data;
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
		x += data.tileWidth * 2 - data.offsetX;
		y += data.tileHeight * 2 - data.offsetY;
		return {
			x: (data.gridX + data.gridWidth - Math.round((y / data.tileHeight) - (x / data.tileWidth))) % data.gridWidth,
			y: (data.gridY + data.gridHeight - 1 + Math.round((y / data.tileHeight) + (x / data.tileWidth))) % data.gridHeight
		}
	};

	this.generate = function () {
		this._mapGenerator.generate();
	};

	this.tick = function (dt) {
		if (this._mapGenerator.generateStep()) {
			this._aStar.update();
			this.emit('Update', this._data);
		}
	};

	this.findPath = function (startX, startY, endX, endY, layer, group, cb) {
		this._aStar.findPath(startX, startY, endX, endY, layer, group, cb);
	};

	this.scrollLeft = function (speed) {
		var data = this._data;

		data.offsetX += speed;
		while (data.offsetX > data.tileWidth) {
			data.gridX = (data.gridX + data.gridWidth - 1) % data.gridWidth;
			data.gridY = (data.gridY + data.gridHeight - 1) % data.gridHeight;
			data.offsetX -= data.tileWidth;
		}
	};

	this.scrollRight = function (speed) {
		var data = this._data;

		data.offsetX -= speed;
		while (data.offsetX < 0) {
			data.gridX = (data.gridX + 1) % data.gridWidth;
			data.gridY = (data.gridY + 1) % data.gridHeight;
			data.offsetX += data.tileWidth;
		}
	};

	this.scrollUp = function (speed) {
		var data = this._data;

		data.offsetY += speed;
		while (data.offsetY > data.tileHeight) {
			data.gridX = (data.gridX + 1) % data.gridWidth;
			data.gridY = (data.gridY + data.gridHeight - 1) % data.gridHeight;
			data.offsetY -= data.tileHeight;
		}
	};

	this.scrollDown = function (speed) {
		var data = this._data;

		data.offsetY -= speed;
		while (data.offsetY < 0) {
			data.gridX = (data.gridX + data.gridWidth - 1) % data.gridWidth;
			data.gridY = (data.gridY + 1) % data.gridHeight;
			data.offsetY += data.tileHeight;
		}
	};

	this.scrollBy = function (offsetX, offsetY) {
		(offsetX > 0) ? this.scrollLeft(offsetX) : this.scrollRight(-offsetX);
		(offsetY > 0) ? this.scrollUp(offsetY) : this.scrollDown(-offsetY);
	};

	this.setCursor = function (cursor) {
		this._data.cursor = cursor;
	};

	this.setSelection = function (startPoint, endPoint) {
		var data = this._data;
		var selection = data.selection;

		if (selection) {
			selection.startPoint = startPoint;
			selection.endPoint = endPoint;
		} else {
			selection = {
				startPoint: startPoint,
				endPoint: endPoint,
				firstPoint: {x: startPoint.x, y: startPoint.y}
			};
			data.selection = selection;
		}

		if (this._selectMode === selectModes.FIXED) {
			selection.startPoint = selection.endPoint;
			selection.endPoint = {
				x: selection.startPoint.x + this._fixedWidth - 1,
				y: selection.startPoint.y + this._fixedHeight - 1
			};
		} else if (this._selectMode === selectModes.LINE) {
			var firstPoint = selection.firstPoint;

			if ((firstPoint.x === endPoint.x) && (firstPoint.y === endPoint.y)) {
				this._lockHorizontal = -1;
			} else if (this._lockHorizontal === -1) {
				if (selection.startPoint.x !== selection.endPoint.x) {
					this._lockHorizontal = 1;
				} else if (selection.startPoint.y !== selection.endPoint.y) {
					this._lockHorizontal = 2;
				}
			} else {
				if (this._lockHorizontal === 1) {
					if ((firstPoint.x === endPoint.x) && (firstPoint.y !== endPoint.y)) {
						this._lockHorizontal = 2;
					}
				} else if (this._lockHorizontal === 2) {
					if ((firstPoint.y === endPoint.y) && (firstPoint.x !== endPoint.x)) {
						this._lockHorizontal = 1;
					}
				}
			}

			switch (this._lockHorizontal) {
				case 1:
					selection.startPoint.y = selection.firstPoint.y;
					selection.endPoint.y = selection.firstPoint.y;
					break;
				case 2:
					selection.startPoint.x = selection.firstPoint.x;
					selection.endPoint.x = selection.firstPoint.x;
					break;
			}
		}

		this.emit('ChangeSelection', selection);
	};

	this.getRect = function (point1, point2) {
		var data = this._data;
		var x1 = Math.min(point1.x, point2.x);
		var x2 = Math.max(point1.x, point2.x);
		var y1 = Math.min(point1.y, point2.y);
		var y2 = Math.max(point1.y, point2.y);
		var rect = {x: x1, y: y1};

		if (x2 - x1 > data.gridWidth * 0.5) {
			var n = x1 + data.gridWidth;
			x1 = x2;
			x2 = n;
			rect.x = x1;
		}
		if (y2 - y1 > data.gridHeight * 0.5) {
			var n = y1 + data.gridHeight;
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
		return this._data.gridWidth;
	};

	this.getHeight = function () {
		return this._data.gridHeight;
	};

	this.clearSelection = function () {
		this._lockHorizontal = -1;
		this._data.selection = null;
	};

	this.onMapReady = function () {
		this.emit('RefreshMap');
	};
});

exports.selectModes = selectModes;