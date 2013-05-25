import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridView = opts.gridView;
		this._modelInfo = [];
	};

	this.tick = function (dt) {
		for (var i in this._modelInfo) {
			var modelInfo = this._modelInfo[i];

			modelInfo.model.tick(dt);

			var opts = modelInfo.model.getOpts();
			var tileOnScreen = this._gridView.isTileVisible(opts.tileX, opts.tileY, opts.x, opts.y);
			if (tileOnScreen) {
				var view = modelInfo.view;
				if (!view) {
					var viewPool = this._gridView.getViewPool(modelInfo.layer);
					if (viewPool) {
						view = viewPool.obtainView();
						view.create(opts, tileOnScreen);
						modelInfo.view = view;
					}
				}
				view && view.setTileOnScreen(opts, tileOnScreen);
			} else if (modelInfo.view) {
				var viewPool = this._gridView.getViewPool(modelInfo.layer);
				viewPool.releaseView(modelInfo.view);
				modelInfo.view = null;
			}
		}
	};

	this.onPopulateGrid = function () {
	};

	this.registerModel = function (model, layer) {
		this._modelInfo.push({
			model: model,
			view: null,
			layer: layer
		});
	};
});