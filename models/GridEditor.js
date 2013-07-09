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
import .GridModel;

exports = Class(function (supr) {
	this.init = function (opts) {
		this._gridModel = opts.gridModel;
		this._modelType = '';
		this._tool = null;
		this._settings = opts.settings;

		this._refreshMapCB = null;
		this._addModelCB = null;
		this._selectionCountCB = null;
		this._editCB = null;
	};

	this.onSelectionApply = function (selection) {
		var tool = this._tool;

		if (!tool || !selection || !selection.accept) {
			return;
		}

		var rect = this._gridModel.getRect(selection.startPoint, selection.endPoint);
		var map = this._gridModel.getMap();
		var selected;

		if (!('layer' in tool)) {
			this._editCB && this._editCB({rect: rect});
			return;
		}

		switch (tool.type) {
			case 'area':
				if ((rect.w >= tool.minWidth) && (rect.h >= tool.minHeight)) {
					// Get the selected value before drawing!
					selected = map.countTiles(tool.layer, tool.group, rect);
					if (selected.changed === 0) {
						return;
					}

					map.drawRect(
						tool.layer,
						rect.x, rect.y, rect.w, rect.h,
						tool.group,
						tool.tileSet
					);
					this._refreshMapCB && this._refreshMapCB();
				}
				break;

			case 'line':
				// Get the selected value before drawing!
				selected = map.countTiles(tool.layer, tool.group, rect);
				if (selected.changed === 0) {
					return;
				}

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

				tool.updater && tool.updater(map, tool, rect);
				this._refreshMapCB && this._refreshMapCB();
				break;

			case 'item':
				// Get the selected value before drawing!
				rect.w = tool.width;
				rect.h = tool.height;
				selected = map.countTiles(tool.layer, tool.group, rect);

				var model = map.putItem(this._modelType, rect.x, rect.y);
				model && this._addModelCB && this._addModelCB(model);

				if (this._refreshMapCB) {
					for (var y = 0; y < rect.h; y++) {
						for (var x = 0; x < rect.w; x++) {
							this._refreshMapCB(rect.x + x, rect.y + y);
						}
					}
				}
				break;
		}

		if (selected) {
			selected.rect = rect;
			this._editCB && this._editCB(selected);
		}
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

			if ('layer' in tool) {
				var count = selection.accept ? map.countTiles(tool.layer, tool.group, rect) : false;
				if (count) {
					count.accept = true;
				}
				this._selectionCountCB && this._selectionCountCB(count);
				if (count && (count.accept === false)) {
					selection.accept = false;
				}				
			}
		} else {
			selection.accept = true;
		}
	};

	this.setTool = function (modelType) {
		var gridModel = this._gridModel;

		this._modelType = modelType;
		this._tool = this._settings[modelType] || null;

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
					gridModel.setFixedWidth(this._tool.width || 1);
					gridModel.setFixedHeight(this._tool.height || 1);
					break;

				case 'point':
					gridModel.setSelectMode(GridModel.selectModes.FIXED);
					break;
			}
		}
	};

	this.setRefreshMapCB = function (refreshMapCB) {
		this._refreshMapCB = refreshMapCB;
	};

	this.setAddModelCB = function (addModelCB) {
		this._addModelCB = addModelCB;
	};

	this.setSelectionCountCB = function (selectionCountCB) {
		this._selectionCountCB = selectionCountCB;
	};

	this.setEditCB = function (editCB) {
		this._editCB = editCB;
	};
});