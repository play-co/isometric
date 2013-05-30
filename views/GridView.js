import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import .tiles.TileGroups as TileGroups;

import .ViewPool;

import .SelectedItemView;

import .GridSelection;
import .GridLayerView;
import .GridProperties;

var cursorYes = new Image({url: 'resources/images/cursorYes.png'});
var cursorNo = new Image({url: 'resources/images/cursorNo.png'});

exports = Class([View, GridProperties], function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				x: 0,
				y: 0,
				width: GC.app.baseWidth,
				height: GC.app.baseHeight
			}
		);

		supr(this, 'init', [opts]);

		this.initProperties(opts);

		this._tileViews = [];
		this._tilesOnScreen = {};
		this._currentPopulation = 0;

		this._minScale = opts.minScale || 0.6;
		this._maxScale = opts.maxScale || 2;

		this._particleSettings = opts.particleSettings;
		this._particleSystems = {};

		this.style.scale = 1;
		this.style.backgroundColor = 'rgb(0, 120, 255)';
	};

	this._populateTiles = function (data) {
		var tilesOnScreen = this._tilesOnScreen;
		var length = this._layers.length;
		var gridWidth = data.gridWidth;
		var gridHeight = data.gridHeight;
		var countX = this._countX;
		var countY = this._countY;
		var offsetZ = (this._maxCountX * this._maxCountY) * 100;
		var gridX = data.gridX;
		var gridY = data.gridY;
		var grid = data.grid;
		var tiles = data.tiles;
		var sizes = this._sizes;
		var currentPopulation = ++this._currentPopulation;
		var tileGroups = this._tileGroups;

		for (var y = 0; y < countY; y++) {
			var a = ~~(y * 0.5);
			var b = gridWidth - a;
			var c = y + gridHeight - a;

			var tileViewLine = this._tileViews[y];

			for (var x = 0; x < countX; x++) {
				var d = (gridX + x + b) % gridWidth;
				var e = (gridY + x + c) % gridHeight;

				var tileViewTile = tileViewLine[x];
				var tileView = tileViewTile[0];
				var tileOnScreen = tilesOnScreen[d + '_' + e];

				if (tileOnScreen) {
					tileOnScreen.currentPopulation = currentPopulation;
					tileOnScreen.x = tileView.startX;
					tileOnScreen.y = tileView.startY;
					tileOnScreen.z = tileView.startZ + offsetZ;
				} else {
					tilesOnScreen[d + '_' + e] = {
						currentPopulation: currentPopulation,
						x: tileView.startX,
						y: tileView.startY,
						z: tileView.startZ + offsetZ
					}
				}

				var gridTile = grid[e][d];
				var i = length;

				while (i) {
					i--;
					var tileView = tileViewTile[i];
					var style = tileView.style;
					var tile = gridTile[i];

					if ((tile.index === -1) || (tile.group >= 10000)) {
						style.visible = false;
					} else {
						var size = sizes[tile.group];

						style.width = size.width;
						style.height = size.height;
						style.x = tileView.left + size.x;
						style.y = tileView.bottom - size.height + size.y;
						style.zIndex = tileView.startZ + size.z[0] * offsetZ + size.z[1];
						style.visible = true;

						tileView.gridTile = gridTile;

						tileGroups.setImage(tileView, tile);
					}
				}
			}
		}

		this._gridX = gridX;
		this._gridY = gridY;

		this.emit('Populated');
	};

	this._buildView = function (data) {
		this._buildViewProperties(data);

		this._layers = [];

		var layers = this._gridSettings.layers;
		for (var i = 0; i < layers.length; i++) {
			var opts = merge(this.getProperties(), layers[i]);
			opts.superview = this;
			opts.index = i;
			opts.tileViews = this._tileViews;
			this._layers.push(new GridLayerView(opts));
		}

		this._selection = new GridSelection({superview: this._layers[0], gridView: this});
		this._selectedItem = new SelectedItemView({superview: this});

		console.log('Tiles per view:', this._maxCountY * this._maxCountX);

		this.emit('Ready');
	};

	this.gridToPoint = function (data, grid) {
		var gridX = grid.x;
		var gridY = grid.y;
		var minX = -this._tileWidth;
		var maxX = (this._countY + 1) * this._tileWidth;
		var minY = -this._tileHeight;
		var maxY = (this._countX + 1) * this._tileHeight;
		var w = this._tileWidth * 0.5;
		var h = this._tileHeight * 0.5;

		for (var i = -1; i < 2; i++) {
			for (var j = -1; j < 2; j++) {
				var x = -data.gridX + gridX + i * data.gridWidth;
				var y = -data.gridY + gridY + j * data.gridHeight;
				var a = (x * w) + (y * w) - this._tileWidth * this._underDrawX + data.offsetX;
				var b = (y * h) - (x * h) - this._tileHeight * this._underDrawY + data.offsetY;

				if ((a >= minX) && (a <= maxX) && (b >= minY) && (b <= maxY)) {
					return {x: a, y: b};
				}
			}
		}

		return false;
	};

	this.onInputStart = function (evt) {
		if (this._selectedItem.style.visible) {
			this.emit('UnselectItem');
			this._selectedItem.style.visible = false;
		}
	};

	this.onSelectItem = function (view, gridTile) {
		this.emit('SelectItem', view, gridTile);
		this._selectedItem.setView(view, this._offsetX, this._offsetY);
	};

	this.onUpdate = function (data) {
		this._needsBuild && this._buildView(data);

		if ((this._gridX !== data.gridX) || (this._gridY !== data.gridY)) {
			this._populateTiles(data);
		}

		var offsetX = -this._tileWidth * this._underDrawX + data.offsetX;
		var offsetY = -this._tileHeight * this._underDrawY + data.offsetY;

		if ((this._offsetX !== offsetX) || (this._offsetY !== offsetY)) {
			var i = this._layers.length;

			while (i) {
				var layer = this._layers[--i];
				layer.style.x = offsetX;
				layer.style.y = offsetY;
			}

			this._offsetX = offsetX;
			this._offsetY = offsetY;

			var tilesOnScreen = this._tilesOnScreen;
			var particleSystems = this._particleSystems;
			var currentPopulation = this._currentPopulation;

			for (var index in particleSystems) {
				var tileOnScreen = tilesOnScreen[index];
				var particleSystem = particleSystems[index];

				if (tileOnScreen.currentPopulation === currentPopulation) {
					var style = particleSystem.style;

					style.x = tileOnScreen.x;
					style.y = tileOnScreen.y;
					style.zIndex = tileOnScreen.z + 50;
				} else {
					particleSystem.release();
				}
			}
		}

		data.selection ? this._selection.show(data, offsetX, offsetY) : this._selection.clear();
	};

	this.tick = function (dt) {
		var layers = this._layers;
		var i = layers ? layers.length : 0;
		while (i) {
			var layer = layers[--i];
			var particleSystems = layer.particleSystems;
			if (particleSystems) {
				var j = particleSystems.getLength();
				var views = particleSystems.getViews();
				while (j) {
					views[--j].update(dt);
				}
			}
		}
	};

	this.isTileVisible = function (tileX, tileY, x, y) {
		var tileOnScreen = this._tilesOnScreen[tileX + '_' + tileY];
		if (tileOnScreen && (tileOnScreen.currentPopulation === this._currentPopulation)) {
			return {
				x: tileOnScreen.x + y * this._deltaX + x * this._deltaX,
				y: tileOnScreen.y + this._deltaX - x * this._deltaY + y * this._deltaY,
				z: tileOnScreen.z
			};
		}

		return false;
	};

	this.onRefreshMap = function (x, y) {
		if (x === undefined) {
			this._gridX = null;
		} else {
			var tileOnScreen = this._tilesOnScreen[x + '_' + y];
			if (tileOnScreen) {
				var tile = this._grid[y][x];
				var tileViews = tileViews[y][x];
				for (var i = 0; i < this._layers.length; i++) {
					var tileView = tileViews[i].tileViews[y][x];

					if (tile[i].index === -1) {
						tileView.visible = false;
					} else {
						tileView.setImage(this._tileGroups.getImage(tile[i]));
						tileView.visible = true;
					}
				}
			}
		}
	};

	this.onAddParticles = function (type, tileX, tileY, x, y) {
		var index = tileX + '_' + tileY;
		var tileOnScreen = this._tilesOnScreen[index];
		var particleSystems = this._particleSystems;

		if (tileOnScreen) {
			if (tileOnScreen.currentPopulation === this._currentPopulation) {
				var particleSystem = tileOnScreen.particleSystem;
				if (!particleSystem) {
					particleSystem = this._layers[1].particleSystems.obtainView()

					particleSystem.onRelease = function () {
						delete particleSystems[index];
						tileOnScreen.particleSystem = false;
					};

					tileOnScreen.particleSystem = particleSystem;
					particleSystems[index] = particleSystem;

					var style = particleSystem.style;

					style.x = tileOnScreen.x;
					style.y = tileOnScreen.y;
					style.zIndex = tileOnScreen.z + 50;
				}

				particleSystem.addParticle('hit', x, y);
			} else if (tileOnScreen.particleSystem) {
				tileOnScreen.particleSystem.release();
				tileOnScreen.particleSystem = false;
			}
		}
	};

	this.getViewPool = function (layer) {
		return this._layers[layer] ? this._layers[layer].viewPool : false;
	};

	this.getScale = function () {
		return this.style.scale;
	};

	this.setScale = function (scale) {
		if (scale < this._minScale) {
			scale = this._minScale;
		} else if (scale > this._maxScale) {
			scale = this._maxScale;
		}
		if (scale === this.style.scale) {
			return;
		}

		var startWidth = this.style.width / this.style.scale;
		var startHeight = this.style.height / this.style.scale;

		var endWidth = this.style.width / scale;
		var endHeight = this.style.height / scale;

		var countX = this._countX;
		var countY = this._countY;
		var overDrawX = this._underDrawX + this._overDrawX;
		var overDrawY = this._underDrawY + this._overDrawY;

		this._countX = (this.style.width / (this._tileWidth * scale) + overDrawX) | 0;
		this._countY = (this.style.height / (this._tileHeight * scale) * 2 + overDrawY) | 0;

		this.style.scale = scale;

		var tileViews = this._tileViews;
		var layers = this._layers.length;
		for (var y = countY; y < this._countY; y++) {
			var line = tileViews[y];
			for (var x = countX; x < this._countX; x++) {
				var tile = line[x];
				var i = layers;
				while (i) {
					tile[--i].style.visible = false;
				}
			}
		}

		if ((this._countX !== countX) || (this._countY !== countY)) {
			this._gridX = null;
		}

		var dir = (this.style.scale > scale) ? -0.5 : 0.5;
		this.emit('ChangeOffset', (endWidth - startWidth) * dir, (endHeight - startHeight) * dir);
	};

	this.hideSelectedItem = function () {
		this._selectedItem.style.visible = false;
	};
});