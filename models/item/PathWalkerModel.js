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

	this._tileValid = function (gridX, gridY) {
		this._rect.x = gridX;
		this._rect.y = gridY;

		return this._map.acceptRect(this._rect, this._conditions);
	};

	this._findPath = function () {
		var opts = this._opts;

		var map = this._map;
		var mapWidth = map.getWidth();
		var mapHeight = map.getHeight();

		var options = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];
		var direction = null;
		var directionTest = 0;
		var denyDirection = null;

		var path = this._startPath;
		var startX = path[path.length - 1].x;
		var startY = path[path.length - 1].y;
		var x = startX;
		var y = startY;

		var addPoint = function () {
				x = (x + mapWidth + direction.x) % mapWidth;
				y = (y + mapHeight + direction.y) % mapHeight;
				path.push({x: x, y: y});
			};

		while (path.length < this._maxPathLength) {
			var directionsTested = 0;
			directionTest++;
			while ((direction === null) && (directionsTested < 4)) {
				var option = options[(Math.random() * 4) | 0];
				if (option.directionTest !== directionTest) {
					directionsTested++;
					option.directionTest = directionTest;
					if (this._tileValid(x + option.x, y + option.y)) {
						if (denyDirection && (denyDirection.x === option.x) && (denyDirection.y === option.y)) {

						} else {
							direction = option;
						}
					}
				}
			}

			if (!direction) {
				break;
			}

			if (this._tileValid(x + direction.x, y + direction.y)) {
				var tile = map.getTile(x + direction.x, y + direction.y)[1];
				if ((tile.index === 10) || (tile.index === 24) || (tile.index === 48) || (tile.index === 144)) {
					if (!((startX === x) && (startY === y))) {
						addPoint();
						break;
					}
				} else if (!((tile.index === 56) || (tile.index === 146))) {
					addPoint();
					denyDirection = {x: direction.x ? -direction.x : 0, y: direction.y ? -direction.y : 0};
					direction = null;
				}
				if (direction) {
					addPoint();
					if ((startX === x) && (startY === y)) {
						break;
					}
				}
			} else {
				direction = null;
			}
		}

		if ((startX !== x) || (startY !== y)) {
			var i = path.length - 1;
			while (i) {
				i--;
				path.push({x: path[i].x, y: path[i].y});
			}
		}
		if (path.length > 2) {
			this.setPath(path);
		}
	};

	this.tick = function (dt) {
		supr(this, 'tick', arguments);

		var opts = this._opts;

		if (this._needsPath) {
			this._findPath();
			this._needsPath = false;
		}

		if (!this._path) {
			opts.visible = false;
			this.emit('Update', opts);
			this.emit('Sleep', this);

			return DynamicModel.tickResult.SLEEP;
		}

		var tile = this._path[0];
		opts.visible = !((opts.tileX === tile.x) && (opts.tileY === tile.y));

		return DynamicModel.tickResult.CONTINUE;
	};

	this.setPath = function (path) {
		supr(this, 'setPath', arguments);

		this._needsPath = false;
	};
});