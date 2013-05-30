import ui.View as View;
import ui.ImageView as ImageView;

import .item.ItemView as ItemView;

import .ViewPool;
import .ParticleSystemView;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		var tileViews = opts.tileViews;
		var maxCountX = opts.maxCountX;
		var maxCountY = opts.maxCountY;
		var layerIndex = opts.index;

		opts = merge(
			opts,
			{
				x: 0,
				y: 0,
				width: maxCountX * opts.tileWidth,
				height: maxCountY * opts.tileHeight,
			}
		);
		supr(this, 'init', [opts]);

		if (opts.dynamicViews) {
			this.viewPool = new ViewPool({
				initCount: opts.dynamicViews,
				ctor: ItemView,
				initOpts: {
					superview: this,
					itemSettings: opts.itemSettings,
					particleSettings: opts.particleSettings
				}
			});
		}

		if (opts.particleSystems) {
			this.particleSystems = new ViewPool({
				initCount: opts.dynamicViews,
				ctor: ParticleSystemView,
				initOpts: {
					superview: this,
					particleSettings: opts.particleSettings,
					particleSystemsCB: bind(this, function () { return this.particleSystems; }),
					particleSystemSize: opts.particleSystemSize,
					tileWidth: opts.tileWidth,
					tileHeight: opts.tileHeight
				}
			});
		}

		for (y = 0; y < maxCountY; y++) {
			if (!tileViews[y]) {
				tileViews[y] = [];
			}

			var offsetX = (y & 1) * opts.tileWidth * 0.5;
			var line = [];

			for (x = 0; x < maxCountX; x++) {
				if (!tileViews[y][x]) {
					tileViews[y][x] = [];
				}
				var view = new ImageView({
						superview: this,
						x: offsetX + x * opts.tileWidth,
						y: y * opts.tileHeight * 0.5,
						zIndex: (y * maxCountX + x) * 100,
						width: opts.tileWidth,
						height: opts.tileHeight,
						visible: false
					});

				tileViews[y][x][layerIndex] = view;

				view.startX = view.style.x;
				view.startY = view.style.y;
				view.startZ = (y * maxCountX + x) * 100;
				view.left = offsetX + x * opts.tileWidth;
				view.bottom = y * opts.tileHeight * 0.5 + opts.tileHeight;

				if (!opts.blockEvents) {
					(bind(this, function (x, y, view) {
						view.gridTile = null;
						view.onInputStart = bind(this, function (evt) {
							evt.cancel();
							view.gridTile.model && this._gridView.onSelectItem(view, view.gridTile);
						});
					}))(x, y, view);
				}
			}
		}
	};
});