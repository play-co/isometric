import event.Emitter as Emitter;

import .GridModel;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridModel = opts.gridModel;
		this._tool = null;
		this._settings = opts.settings;
	};

	this.onSelectionApply = function (selection) {
		var tool = this._tool;

		if (!tool || !selection || !selection.accept) {
			return;
		}

		var rect = this._gridModel.getRect(selection.startPoint, selection.endPoint);
		var map = this._gridModel.getMap();
		var selected;

		switch (tool.type) {
			case 'area':
				if ((rect.w >= tool.minWidth) && (rect.h >= tool.minHeight)) {
					// Get the selected value before drawing!
					selected = map.countTiles(tool.layer, tool.group, rect);

					map.drawRect(
						tool.layer,
						rect.x, rect.y, rect.w, rect.h,
						tool.group,
						tool.tileSet
					);
					this.emit('RefreshMap');
				}
				break;

			case 'line':
				// Get the selected value before drawing!
				selected = map.countTiles(tool.layer, tool.group, rect);

				if (rect.w > rect.h) {
					map.drawLineHorizontal(
						tool.layer,
						rect.x, rect.y, rect.w,
						tool.group,
						tool.tileSet.horizontal
					);
				} else {
					map.drawLineVertical(
						tool.layer,
						rect.x, rect.y, rect.h,
						tool.group,
						tool.tileSet.vertical
					);
				}
				tool.validator && tool.validator(map, tool, rect);
				this.emit('RefreshMap');
				break;

			case 'item':
				var model = false;
				var modelIndex = 10000;
				var layer = tool.layer;
				var group = tool.group;
				var index = tool.index;
				var x = rect.x;
				var y = rect.y;

				if (tool.model) {
					model = new tool.model(
						merge(
							{
								gridModel: this._gridModel,
								layer: layer,
								group: group,
								index: index,
								x: x,
								y: y,
								width: tool.width,
								height: tool.height,
								surrounding: tool.surrounding
							},
							tool.modelOpts || {}
						)
					).on('Refresh', bind(this, 'publish', 'RefreshMap'));

					group = model.getGroup();
					index = model.getIndex();
					modelIndex = 10001 + y * map.getWidth() + x;

					this.emit('AddModel', model);
				} else if (tool.surrounding) {
					map.drawSurrounding(x, y, layer, tool.surrounding);
				}

				// Get the selected value before drawing!
				rect.w = tool.width;
				rect.h = tool.height;
				selected = map.countTiles(tool.layer, tool.group, rect);

				for (var j = 0; j < tool.height; j++) {
					for (var i = 0; i < tool.width; i++) {
						map.drawTile(tool.layer, x + i, y + j, modelIndex, 0, false);
					}
				}
				map.drawTile(tool.layer, x, y + tool.height - 1, group, index, model);
				this.emit('RefreshMap');
				break;
		}

		selected && this._gridModel.emit('Edit', selected);
	};

	this.onSelectionChange = function (selection) {
		if (!this._tool) {
			return;
		}

		var tool = this._tool;
		var gridModel = this._gridModel;
		var rect = gridModel.getRect(selection.startPoint, selection.endPoint);

		selection.accept = false;

		var conditions = tool.conditions;
		if (conditions) {
			var map = this._gridModel.getMap();
			selection.accept = map.acceptRect(rect, conditions) && !map.declineRect(rect, conditions);

			var count = selection.accept ? map.countTiles(tool.layer, tool.group, rect) : false;
			if (count) {
				count.accept = true;
			}
			this.emit('SelectionCount', count);
			if (count && (count.accept === false)) {
				selection.accept = false;
			}
		}
	};

	this.setTool = function (tool) {
		var gridModel = this._gridModel;

		this._tool = this._settings[tool] || null;
		if (this._tool) {
			switch (this._tool.type) {
				case 'area':
					gridModel.setSelectMode(GridModel.selectModes.AREA);
					break;

				case 'line':
					gridModel.setSelectMode(GridModel.selectModes.LINE);
					break;

				case 'item':
					gridModel.setSelectMode(GridModel.selectModes.FIXED);
					gridModel.setFixedWidth(this._tool.width);
					gridModel.setFixedHeight(this._tool.height);
					break;

				case 'point':
					gridModel.setSelectMode(GridModel.selectModes.FIXED);
					break;
			}
		}
	};
});