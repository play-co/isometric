import event.Emitter as Emitter;

import .models.item.DynamicModel as DynamicModel;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridView = opts.gridView;
		this._activeList = [];
		this._sleepList = [];
	};

	this.tick = function (dt) {
		var tickResult = DynamicModel.tickResult;
		var activeList = this._activeList;
		var sleepList = this._sleepList;
		var gridView = this._gridView;
		var i = activeList.length;

		while (i) {
			var modelInfo = activeList[--i];
			var model = modelInfo.model;
			var view = modelInfo.view;
			var removeView = false;
			var result = model.tick(dt);

			switch (result) {
				case tickResult.SLEEP:
					sleepList[model.getId()] = modelInfo;
					// Do not break!

				case tickResult.REMOVE:
					if (view) {
						removeView = view;
					}
					if (i === activeList.length - 1) {
						delete activeList[activeList.length - 1];
						activeList.length--;
					} else {
						delete activeList[i];
						activeList[i++] = activeList.pop();
					}
					break;

				case tickResult.CONTINUE:
					var opts = model.getOpts();
					var tileOnScreen = gridView.isTileVisible(opts.tileX, opts.tileY, opts.x, opts.y);

					model.setOnScreen(tileOnScreen ? true : false);

					if (tileOnScreen) {
						if (!view) {
							var viewPool = gridView.getViewPool(modelInfo.layer);
							if (viewPool) {
								view = viewPool.obtainView();
								if (!view.updateCallback) {
									view.updateCallback = bind(view, 'onUpdate');
								}
								model.on('Update', view.updateCallback);
								view.create(opts, tileOnScreen);
								modelInfo.view = view;
							}
						}
						view && view.setTileOnScreen(opts, tileOnScreen);
					} else if (view) {
						removeView = view;
					}
					break;
			}

			if (removeView) {
				model.removeListener('Update', removeView.updateCallback);
				var viewPool = gridView.getViewPool(modelInfo.layer);
				viewPool.releaseView(removeView);
				modelInfo.view = null;
			}
		}
	};

	this.registerModel = function (model, layer) {
		this._activeList.push({
			model: model,
			view: null,
			layer: layer
		});
		this._sleepList[model.getId()] = false;
	};

	this.wakeupModel = function (model) {
		var modelInfo = this._sleepList[model.getId()];
		if (modelInfo) {
			this._activeList.push(modelInfo);
		} else {
			console.warn('Failed to wakeup model', model.getId());
		}
	};
});