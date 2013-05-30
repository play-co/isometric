exports = Class(function () {
	this.init = function (opts) {
		var width = opts.width;
		var height = opts.height;
		var layers = opts.layers.length;
		var grid = [];

		for (var y = 0; y < height; y++) {
			var line = [];
			for (var x = 0; x < width; x++) {
				var tile = [];
				var i = layers;
				while (i--) {
					tile.push({index: -1, randomIndex: -1, group: 0});
				}
				line.push(tile);
			}
			grid.push(line);
		}

		this._settings = opts.settings;

		this._width = width;
		this._height = height;

		this._layers = layers;
		this._grid = grid;

		this._randomTiles = [];

		var randomTiles = this._settings.randomTiles;
		for (var i = 0; i < randomTiles.length; i++) {
			var randomTile = randomTiles[i];
			if (!this._randomTiles[randomTile.group]) {
				this._randomTiles[randomTile.group] = [];
			}
			this._randomTiles[randomTile.group][randomTile.index] = randomTile.chances;
		}
	};

	this.clear = function () {
		var grid = this._grid;
		var layers = this._layers;

		for (var y = 0; y < this._height; y++) {
			var line = grid[y];
			for (var x = 0; x < this._width; x++) {
				var tile = [];
				var i = layers;

				while (i) {
					i--;
					tile.push({
						group: 0,
						index: -1,
						randomIndex: -1
					});
				}
				line[x] = tile;
			}
		}
	};

	this.clearLayer = function (layer) {
		var grid = this._grid;

		for (var y = 0; y < this._height; y++) {
			var line = grid[y];
			for (var x = 0; x < this._width; x++) {
				var tile = line[x][layer];
				tile.index = -1;
				tile.randomIndex = -1;
				tile.group = 0;
			}
		}
	};

	this.zeroLayer = function (layer, group) {
		var grid = this._grid;

		for (var y = 0; y < this._height; y++) {
			var line = grid[y];
			for (var x = 0; x < this._width; x++) {
				this.setTile(line[x][layer], 0, group);
			}
		}
	};

	this.getGrid = function () {
		return this._grid;
	};

	this.getWidth = function () {
		return this._width;
	};

	this.getHeight = function () {
		return this._height;
	};

	this.setTile = function (tile, index, group) {
		var randomIndex = -1;
		if (this._randomTiles[group]) {
			var chances = this._randomTiles[group][index];

			if (chances) {
				var chance = 0;
				var random = Math.random();
				var i = chances.length;

				randomIndex = 0;

				while (i) {
					chance += chances[--i];
					if (random < chance) {
						randomIndex = i;
						break;
					}
				}
			}
		}

		tile.index = index;
		tile.randomIndex = randomIndex;
		tile.group = group;
	};

	this.getTile = function (x, y) {
		var width = this._width;
		var height = this._height;
		var mw = width * 10;
		var mh = height * 10;

		x = (x + mw) % width;
		y = (y + mh) % height;

		return this._grid[y][x];
	};

	this.orTile = function (tile, group, index) {
		if (tile.index === -1) {
			tile.index = 0;
		}
		this.setTile(tile, tile.index | index, group);
	};

	/**
	 * Call `onUpdateMap` on all models which are located within the given rectangle.
	 */
	this._updateModels = function (x, y, w, h) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;
		var models = {};
		var mw = width * 10;
		var mh = height * 10;

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + mw) % width;
			var indexX = (w > 2) ? (((i + w - 3) / (w - 2)) | 0) : (i * 2);

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + mh) % height;
				var indexY = (h > 2) ? (((j + h - 3) / (h - 2)) | 0) : (j * 2);
				var tile = grid[gridY][gridX];

				if (tile.model) {
					var modelIndex = 10001 + gridY * width + gridX;
					models[modelIndex] = true;
				} else if (tile[1].group > 10000) {
					models[tile[1].group] = true;
				}
			}
		}

		for (var modelIndex in models) {
			var index = parseInt(modelIndex, 10) - 10001;
			var gridX = index % width;
			var gridY = (index / width) | 0;
			var model = grid[gridY][gridX].model;

			model && model.onUpdateMap && model.onUpdateMap();
		}
	};

	this.drawTile = function (layer, x, y, group, index, model) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;
		var mw = width * 10;
		var mh = height * 10;

		x = (x + mw) % width;
		y = (y + mh) % height;

		var tile = grid[y][x];
		this.setTile(tile[layer], index, group);
		if (model && !tile.model) {
			tile.model = model;
		}
	};

	this.drawRect = function (layer, x, y, w, h, group, tileSet) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;
		var mw = width * 10;
		var mh = height * 10;

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + mw) % width;
			var indexX = (w > 2) ? (((i + w - 3) / (w - 2)) | 0) : (i * 2);

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + mh) % height;
				var indexY = (h > 2) ? (((j + h - 3) / (h - 2)) | 0) : (j * 2);
				var tile = grid[gridY][gridX];

				this.orTile(tile[layer], group, tileSet[indexY][indexX]);
			}
		}

		this._updateModels(x - 1, y - 1, w + 2, h + 2);
	};

	this.drawLineHorizontal = function (layer, x, y, l, group, tileSet) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;
		var mw = width * 10;
		var mh = height * 10;
		var tile;

		y = (y + mh) % height;

		if (l === 1) {
			this.orTile(grid[y][x][layer], group, 16);
		} else {
			this.orTile(grid[y][(x + mw) % width][layer], group, tileSet[0]);
			this.orTile(grid[y][(x + l - 1 + mw) % width][layer], group, tileSet[2]);

			for (var i = 1; i < l - 1; i++) {
				this.orTile(grid[y][(x + i + mw) % width][layer], group, tileSet[1]);
			}
		}
		this._updateModels(x - 1, y - 1, l + 2, 3);
	};

	this.drawLineVertical = function (layer, x, y, l, group, tileSet) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;
		var mw = width * 10;
		var mh = height * 10;
		var tile;

		x = (x + mw) % width;

		if (l === 1) {
			this.orTile(grid[y][x][layer], group, 16);
		} else {
			this.orTile(grid[(y + mh) % height][x][layer], group, tileSet[0]);
			this.orTile(grid[(y + l - 1 + mh) % width][x][layer], group, tileSet[2]);

			for (var i = 1; i < l - 1; i++) {
				this.orTile(grid[(y + i + mh) % height][x][layer], group, tileSet[1]);
			}
		}
		this._updateModels(x - 1, y - 1, 3, l + 2);
	};

	this.drawSurrounding = function (layer, x, y, surrounding) {
		var i = surrounding.length;
		while (i) {
			var s = surrounding[--i];
			var t = this.getTile(x + s.x, y + s.y);
			var j = s.groups.length;
			while (j) {
				var group = s.groups[--j];
				if (t[layer].group === group) {
					this.orTile(t[layer], group, s.index);
					break;
				}
			}
		}
	};

	this.isEmpty = function (layer, x, y, w, h) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + height) % height;
				var tile = grid[gridY][gridX];

				if (tile[layer].index !== -1) {
					return false;
				}
			}
		}

		return true;
	};

	this.isEmptyOrZero = function (layer, x, y, w, h) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + height) % height;
				var tile = grid[gridY][gridX];

				if (tile[layer].index > 0) {
					return false;
				}
			}
		}

		return true;
	};

	this.isGroup = function (layer, x, y, w, h, groups) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		var g = {};
		groups.map(function (a) { g[a] = true; }, {});

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + height) % height;
				var tile = grid[gridY][gridX];

				if (!(tile[layer].group in g)) {
					return false;
				}
			}
		}

		return true;
	};

	this.isTiles = function (layer, x, y, w, h, tiles) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + height) % height;
				var tile = grid[gridY][gridX];
				var group = tile[layer].group;
				var index = tile[layer].index;
				var found = false;
				var k = tiles.length;

				while (k) {
					var acceptTile = tiles[--k];
					if ((group === acceptTile.group) && acceptTile.tiles[index]) {
						found = true;
						break;
					}
				}
				if (!found) {
					return false;
				}
			}
		}

		return true;
	};

	this.isGroupOrEmpty = function (layer, x, y, w, h, groups) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		var g = {};
		groups.map(function (a) { g[a] = true; }, {});

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + height) % height;
				var tile = grid[gridY][gridX];

				if ((tile[layer].index !== -1) && !(tile[layer].group in g)) {
					return false;
				}
			}
		}

		return true;
	};

	this.acceptRect = function (rect, conditions) {
		if (!conditions) {
			return false;
		}

		var result = false;
		var accept = conditions.accept;

		for (var i = 0; i < accept.length && !result; i++) {
			var condition = accept[i];
			switch (condition.type) {
				case 'emptyOrZero':
					result = this.isEmptyOrZero(condition.layer, rect.x, rect.y, rect.w, rect.h);
					break;

				case 'group':
					result = this.isGroup(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.groups);
					break;
			}
		}
		return result;
	};

	this.declineRect = function (rect, conditions) {
		if (!conditions) {
			return false;
		}

		var result = false;
		var decline = conditions.decline;

		if (decline) {
			for (var i = 0; i < decline.length && !result; i++) {
				var condition = decline[i];
				switch (condition.type) {
					case 'notEmpty':
						if (!this.isEmpty(condition.layer, rect.x, rect.y, rect.w, rect.h)) {
							result = true;
						}
						break;

					case 'notEmptyAndNotGroup':
						if (!this.isEmpty(condition.layer, rect.x, rect.y, rect.w, rect.h) &&
							!this.isGroupOrEmpty(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.groups)) {
							result = true;
						}
						break;

				}
			}
		}

		return result;
	};

	this.floodFill = function (layer, fromGroup, toGroup, x, y) {
		var check = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];
		var tile = this.getTile(x, y);

		tile[layer].group = toGroup;

		while (true) {
			var foundX = false;
			var foundY = false;
			var foundCount = 0;

			var i = check.length;
			while (i) {
				i--;
				var a = x + check[i].x;
				var b = y + check[i].y;
				tile = this.getTile(a, b);
				if (tile[layer].group === fromGroup) {
					foundX = a;
					foundY = b;
					foundCount++;
				}
			}

			if (foundCount === 0) {
				return;
			} else if (foundCount === 1) {
				tile = this.getTile(foundX, foundY);
				tile[layer].group = toGroup;
				x = foundX;
				y = foundY;
			} else {
				var i = check.length;
				while (i) {
					i--;
					var a = x + check[i].x;
					var b = y + check[i].y;
					tile = this.getTile(a, b);
					if (tile[layer].group === fromGroup) {
						tile[layer].group = toGroup;
						this.floodFill(layer, fromGroup, toGroup, a, b);
					}
				}
			}
		}
	};

	this.countTiles = function (layer, group, rect) {
		var result = {total: 0, changed: 0};
		var width = this._width;
		var height = this._height;
		var grid = this._grid;
		var x = rect.x;
		var w = rect.w;
		var y = rect.y;
		var h = rect.h;

		for (var i = 0; i < w; i++) {
			var gridX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var gridY = (y + j + height) % height;
				var tile = grid[gridY][gridX];

				result.total++;
				if (tile[layer].group !== group) {
					result.changed++;
				}
			}
		}

		return result;
	};
});