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
exports = Class(function () {
	this.init = function (opts) {
		var width = opts.width;
		var height = opts.height;
		var layers = opts.layers.length;
		var grid = [];

		for (var tileY = 0; tileY < height; tileY++) {
			var line = [];
			for (var tileX = 0; tileX < width; tileX++) {
				var tile = [];
				var i = layers;
				while (i--) {
					tile.push({index: -1, randomIndex: -1, group: 0});
				}
				line.push(tile);
			}
			grid.push(line);
		}

		this._mapSettings = opts.mapSettings || {};
		this._editorSettings = opts.editorSettings || {};
		this._initRules();

		this._width = width;
		this._height = height;

		this._layers = layers;
		this._grid = grid;

		this._randomTiles = [];

		this._itemOwner = opts.itemOwner;

		var randomTiles = this._mapSettings.randomTiles || [];
		for (var i = 0; i < randomTiles.length; i++) {
			var randomTile = randomTiles[i];
			if (!this._randomTiles[randomTile.group]) {
				this._randomTiles[randomTile.group] = [];
			}
			this._randomTiles[randomTile.group][randomTile.index] = randomTile.chances;
		}
	};

	this._initRules = function () {
		var rules = this._mapSettings.rules || [];
		this._rules = {};
		this._ruleResult = {};

		for (var r in rules) {
			var rule = rules[r];
			var aIndex = rule.ag + '_' + rule.ai;
			if (!this._rules[aIndex]) {
				this._rules[aIndex] = {};
			}
			this._rules[aIndex][rule.bg + '_' + rule.bi] = rule;
			this._ruleResult[rule.rg + '_' + rule.ri] = true;
		}
	};

	this.clear = function () {
		var grid = this._grid;
		var layers = this._layers;

		for (var tileY = 0; tileY < this._height; tileY++) {
			var line = grid[tileY];
			for (var tileX = 0; tileX < this._width; tileX++) {
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
				line[tileX] = tile;
			}
		}
	};

	this.clearLayer = function (layer) {
		var grid = this._grid;

		for (var tileY = 0; tileY < this._height; tileY++) {
			var line = grid[tileY];
			for (var tileX = 0; tileX < this._width; tileX++) {
				var tile = line[tileX][layer];
				tile.index = -1;
				tile.randomIndex = -1;
				tile.group = 0;
			}
		}
	};

	this.zeroLayer = function (layer, group) {
		var grid = this._grid;

		for (var tileY = 0; tileY < this._height; tileY++) {
			var line = grid[tileY];
			for (var tileX = 0; tileX < this._width; tileX++) {
				this.setTile(line[tileX][layer], group, 0);
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

	this.getLayers = function () {
		return this._layers;
	};

	this.setTile = function (tile, group, index) {
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

	this.getTile = function (tileX, tileY) {
		var width = this._width;
		var height = this._height;
		var mw = width * 10;
		var mh = height * 10;

		tileX = (tileX + mw) % width;
		tileY = (tileY + mh) % height;

		return this._grid[tileY][tileX];
	};

	this.orTile = function (tile, group, index) {
		// Source group:
		var ag = tile.group;
		var ai = tile.index;
		// Result group:
		var rg = group;
		var ri = tile.index;
		if (ri === -1) {
			ri = 0;
		}
		ri = ri | index;

		var aIndex = ag + '_' + ai;
		if (this._rules[aIndex]) {
			var bIndex = group + '_' + index;
			var rule = this._rules[aIndex][bIndex];
			if (rule) {
				rg = rule.rg;
				ri = rule.ri;
			}
		}

		this.setTile(tile, rg, ri);
	};

	/**
	 * Call `onUpdateMap` on all models which are located within the given rectangle.
	 */
	this._updateModels = function (x, y, w, h) {
		var grid = this._grid;
		var modelLayer = grid[0][0].length - 1;
		var width = this._width;
		var height = this._height;
		var models = {};
		var mw = width * 10;
		var mh = height * 10;

		if (modelLayer === 0) {
			return;
		}

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + mw) % width;
			var indexX = (w > 2) ? (((i + w - 3) / (w - 2)) | 0) : (i * 2);

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + mh) % height;
				var indexY = (h > 2) ? (((j + h - 3) / (h - 2)) | 0) : (j * 2);
				var tile = grid[tileY][tileX];

				if (tile.model) {
					var modelIndex = 10001 + tileY * width + tileX;
					models[modelIndex] = true;
				} else if (tile[modelLayer].group > 10000) {
					models[tile[modelLayer].group] = true;
				}
			}
		}

		for (var modelIndex in models) {
			var index = parseInt(modelIndex, 10) - 10001;
			var tileX = index % width;
			var tileY = (index / width) | 0;
			var model = grid[tileY][tileX].model;

			model && model.onUpdateMap && model.onUpdateMap();
		}
	};

	this.putItem = function (modelType, tileX, tileY, opts) {
		var editorSetting = this._editorSettings[modelType];

		if (!editorSetting) {
			return null;
		}

		var model = null;
		var modelIndex = 10000;
		var layer = editorSetting.layer;
		var group = editorSetting.group;
		var index = editorSetting.index;

		if (editorSetting.model) {
			opts = merge(
				opts,
				{
					modelType: modelType,
					gridModel: this._itemOwner,
					layer: layer,
					group: group,
					index: index,
					tileX: tileX,
					tileY: tileY,
					width: editorSetting.width,
					height: editorSetting.height,
					surrounding: editorSetting.surrounding,
					refreshMapCB: this._itemOwner.getRefreshMapCB()
				}
			);
			opts = merge(
				opts,
				editorSetting.modelOpts || {}
			);
			model = new editorSetting.model(opts);

			group = model.getGroup();
			index = model.getIndex();
			modelIndex = 10001 + tileY * this._width + tileX;
		} else if (editorSetting.surrounding) {
			this.drawSurrounding(layer, tileX, tileY, editorSetting.surrounding);
		}

		for (var j = 0; j < editorSetting.height; j++) {
			for (var i = 0; i < editorSetting.width; i++) {
				this.drawTile(editorSetting.layer, tileX + i, tileY + j, modelIndex, 0, false);
			}
		}

		this.drawTile(editorSetting.layer, tileX, tileY + editorSetting.height - 1, group, index, model);

		return model;
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
		this.setTile(tile[layer], group, index);
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
			var tileX = (x + i + mw) % width;
			var indexX = (w > 2) ? (((i + w - 3) / (w - 2)) | 0) : (i * 2);

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + mh) % height;
				var indexY = (h > 2) ? (((j + h - 3) / (h - 2)) | 0) : (j * 2);
				var tile = grid[tileY][tileX];

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

	this.drawSurrounding = function (layer, tileX, tileY, surrounding) {
		var i = surrounding.length;
		while (i) {
			var s = surrounding[--i];
			var t = this.getTile(tileX + s.tileX, tileY + s.tileY);
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

	this.isEmpty = function (layer, x, y, w, h, validator) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];

				if ((tile[layer].index !== -1) &&
					(!validator || (validator && !validator(this, tileX, tileY, x, y, w, h)))) {
					return false;
				}
			}
		}

		return true;
	};

	this.isEmptyOrZero = function (layer, x, y, w, h, validator) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];

				if ((tile[layer].index > 0) &&
					(!validator || (validator && !validator(this, tileX, tileY, x, y, w, h)))) {
					return false;
				}
			}
		}

		return true;
	};

	this.isGroup = function (layer, x, y, w, h, groups, validator) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		var g = {};
		groups.map(function (a) { g[a] = true; }, {});

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];

				if (!(tile[layer].group in g) &&
					(!validator || (validator && !validator(this, tileX, tileY, x, y, w, h)))) {
					return false;
				}
			}
		}

		return true;
	};

	this.isTiles = function (layer, x, y, w, h, tiles, validator) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];
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
				if (!found && (!validator || (validator && !validator(this, tileX, tileY, x, y, w, h)))) {
					return false;
				}
			}
		}

		return true;
	};

	this.isGroupOrEmpty = function (layer, x, y, w, h, groups, validator) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		var g = {};
		groups.map(function (a) { g[a] = true; }, {});

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];

				if ((tile[layer].index !== -1) && !(tile[layer].group in g) && 
					(!validator || (validator && !validator(this, tileX, tileY, x, y, w, h)))) {
					return false;
				}
			}
		}

		return true;
	};

	this.isRuleResult = function (group, index) {
		return this._ruleResult[group + '_' + index];
	};

	this.hasGroup = function (layer, x, y, w, h, groups, validator) {
		var width = this._width;
		var height = this._height;
		var grid = this._grid;

		var g = {};
		groups.map(function (a) { g[a] = true; }, {});

		for (var i = 0; i < w; i++) {
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];

				if (tile[layer].group in g) {
					return true;
				} else if (validator && validator(this, tileX, tileY, x, y, w, h)) {
					return true;
				}
			}
		}

		return false;
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
					result = this.isEmptyOrZero(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.validator);
					break;

				case 'group':
					result = this.isGroup(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.groups, condition.validator);
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
						if (!this.isEmpty(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.validator)) {
							result = true;
						}
						break;

					case 'notEmptyAndNotGroup':
						if (!this.isEmpty(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.validator)) {
							if (!this.isGroupOrEmpty(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.groups, condition.validator)) {
								result = true;
							}
						}
						break;

					case 'group':
						if (this.hasGroup(condition.layer, rect.x, rect.y, rect.w, rect.h, condition.groups, condition.validator)) {
							result = true;
						}
					break;
				}
			}
		}

		return result;
	};

	this.floodFill = function (layer, fromGroup, toGroup, tileX, tileY) {
		var check = [{tileX: -1, tileY: 0}, {tileX: 1, tileY: 0}, {tileX: 0, tileY: -1}, {tileX: 0, tileY: 1}];
		var tile = this.getTile(tileX, tileY);

		tile[layer].group = toGroup;

		while (true) {
			var foundX = false;
			var foundY = false;
			var foundCount = 0;

			var i = check.length;
			while (i) {
				i--;
				var a = tileX + check[i].tileX;
				var b = tileY + check[i].tileY;
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
				tileX = foundX;
				tileY = foundY;
			} else {
				var i = check.length;
				while (i) {
					i--;
					var a = tileX + check[i].tileX;
					var b = tileY + check[i].tileY;
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
			var tileX = (x + i + width) % width;

			for (var j = 0; j < h; j++) {
				var tileY = (y + j + height) % height;
				var tile = grid[tileY][tileX];

				result.total++;
				if (tile[layer].group !== group) {
					result.changed++;
				}
			}
		}

		return result;
	};

	this.toJSON = function () {
		var grid = this._grid;
		var width = this._width;
		var height = this._height;
		var layers = this._layers;

		var dataHeader = {width: width, height: height, layers: layers};
		var dataGrid = [];

		var getValueShort = function (value) {
				if (value > 10000) {
					value = -1;
				} else if (value < 0) {
					value = -1;
				}
				value++;

				return String.fromCharCode(48 + value);
			};

		var getValueLong = function (value) {
				if (value > 10000) {
					value = -1;
				} else if (value < 0) {
					value = -1;
				}
				value++;

				var hi = (value / 64) | 0;
				var lo = value & 63;
				return String.fromCharCode(48 + hi) + String.fromCharCode(48 + lo);
			};

		for (var y = 0; y < height; y++) {
			var dataGridStr = '';
			var gridLine = grid[y];
			for (var x = 0; x < width; x++) {
				var gridTile = gridLine[x];
				for (var i = 0; i < layers; i++) {
					var tile = gridTile[i];
					dataGridStr += getValueShort(tile.group) + getValueLong(tile.index) + getValueShort(tile.randomIndex);
				}
			}
			dataGrid.push(dataGridStr);
		}
		var data = {header: dataHeader, grid: dataGrid};

		return data;
	};

	this.fromJSON = function (data) {
		var grid = [];
		var width = data.header.width;
		var height = data.header.height;
		var layers = data.header.layers;

		var dataGrid = data.grid;

		for (var y = 0; y < height; y++) {
			var dataGridStr = dataGrid[y];
			var gridLine = [];
			var index = 0;

			for (var x = 0; x < width; x++) {
				var gridTile = [];

				for (var i = 0; i < layers; i++) {
					var a = dataGridStr.charCodeAt(index++) - 48;
					var b = dataGridStr.charCodeAt(index++) - 48;
					var c = dataGridStr.charCodeAt(index++) - 48;
					var d = dataGridStr.charCodeAt(index++) - 48;

					gridTile.push({
						group: a - 1,
						index: b * 64 + c - 1,
						randomIndex: d - 1
					});
				}

				gridLine.push(gridTile);
			}
			grid.push(gridLine);
		}

		this._grid = grid;
		this._width = width;
		this._height = height;
		this._layers = layers;
	};
});