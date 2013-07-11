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
import event.Emitter as Emitter;

import .models.GridModel as GridModel;
import .models.GridInputModel as GridInputModel;
import .models.GridEditor as GridEditor;
import .models.item.DynamicModel as DynamicModel;

import .views.IsometricView as IsometricView;

import .ModelViewConnector;

/**
 * Wrapper class for both isometric models and views.
 *
 * Events:
 *  - Ready
 *      Published when map is ready.
 *
 *  - SelectionCount
 *      Published when an area is selected for drawing.
 *      Parameter: null|{total,changed}
 *
 *  - Edit
 *      Published when map is editted.
 *
 *  - Scrolled
 *      Published when map tileX or tileY is changed.
 *
 *  - InputStart
 *      Published on mouse or touch down.
 *      Parameters: {MouseEvent}
 *
 *  - InputEnd
 *      Published when mouse up, touch up or drag end.
 *
 *  - SelectItem
 *      Published when an item is selected.
 *      Parameter: {StaticModel}
 *
 *  - UnselectItem
 *      Published when an item is unselected by clicking on an "empty" spot.
 *
 *  - AddStaticModel
 *      Parameter: {StaticModel}
 * 
 *  - AddDynamicModel
 *      Parameter: {DynamicModel}
 *
 *  - WakeupDynamicModel
 *      Parameter: {DynamicModel}
 *
 *  - SleepDynamicModel
 *      Parameter: {DynamicModel}
 */
exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		opts.gridSettings = merge(
			opts.gridSettings,
			{
				width: 64,
				height: 64				
			}
		);

		// Create views...
		this._isometricView = new IsometricView(opts).
			on('ChangeOffset', bind(this, 'onChangeOffset'));

		var gridView = this._isometricView.getGridView();
		var gridInputView = this._isometricView.getGridInputView();

		// Create models...
		this._gridModel = new GridModel({
			gridSettings: opts.gridSettings,
			mapSettings: opts.mapSettings,
			editorSettings: opts.editorSettings || {}
		});

		this._gridEditor = new GridEditor({
			gridModel: this._gridModel,
			settings: opts.editorSettings || {}
		});
		this._gridEditor.setSelectionCountCB(bind(this, 'emit', 'SelectionCount')); // Public
		this._gridEditor.setEditCB(bind(this, 'emit', 'Edit')); // Public
		this._gridEditor.setRefreshMapCB(bind(gridView, 'onRefreshMap'));
		this._gridEditor.setAddModelCB(bind(this, 'onAddStaticModel'));

		this._gridModel.setProgressCB(bind(this, 'onProgress'));
		this._gridModel.setSelectionChangeCB(bind(this._gridEditor, 'onSelectionChange'));
		this._gridModel.setClearCB(bind(gridView, 'onClear'));
		this._gridModel.setUpdateCB(bind(gridView, 'onUpdate'));
		this._gridModel.setAddParticlesCB(bind(gridView, 'onAddParticles'));
		this._gridModel.setClearParticlesCB(bind(gridView, 'onClearParticles'));
		this._gridModel.setRefreshMapCB(bind(gridView, 'onRefreshMap'));
		this._gridModel.setAddModelCB(bind(this, 'onAddStaticModel'));
		this._gridModel.setReadyCB(bind(this, 'emit', 'Ready')); // Public
		this._gridModel.setScrolledCB(bind(this, 'emit', 'Scrolled')); // Public

		this._gridInputModel = new GridInputModel({
			gridModel: this._gridModel
		});
		this._gridInputModel.setSelectionCB(bind(this._gridEditor, 'onSelectionApply'));

		// Connect views...
		gridInputView.
			on('InputStart', bind(this, 'emit', 'InputStart')). // Public
			on('InputSelect', bind(this, 'emit', 'InputEnd')). // Public
			on('EndDrag', bind(this, 'emit', 'InputEnd')). // Public
			on('SelectItem', bind(this, 'emit', 'SelectItem')). // Public
			on('UnselectItem', bind(this, 'emit', 'UnselectItem')); // Public

		gridInputView.setStartCB(bind(this._gridInputModel, 'onStart'));
		gridInputView.setDragCB(bind(this._gridInputModel, 'onDrag'));
		gridInputView.setEndCB(bind(this._gridInputModel, 'onEnd'));
		gridInputView.setSelectCB(bind(this._gridInputModel, 'onSelect'));

		this._modelViewConnector = new ModelViewConnector({
			gridView: gridView
		});
		this._modelViewConnector.setSleepCB(bind(this, 'emit', 'SleepDynamicModel')); // Public
	};

	this.tick = function (dt) {
		this._gridModel.tick(dt);
		this._modelViewConnector.tick(dt);
	};

	this.onProgress = function (progress) {
		this._isometricView.setProgress((100 * progress) | 0);
	};

	this.onChangeOffset = function (x, y) {
		this._gridModel.scrollBy(x, y);
	};

	this.onAddStaticModel = function (model) {
		this._gridModel.getStaticModels().add(model);

		model.setSpawnedModelCB && model.setSpawnedModelCB(bind(this, 'onAddDynamicModel'));
		model.setWakeupModelCB && model.setWakeupModelCB(bind(this, 'onWakeupDynamicModel'));

		this.emit('AddStaticModel', model);		
	};

	this.onAddDynamicModel = function (model, layer) {
		layer = typeof layer === 'undefined' ? 1 : layer;
		this._modelViewConnector.registerModel(model, layer);

		this.emit('AddDynamicModel', model, layer);
	};

	this.onWakeupDynamicModel = function (model) {
		this._modelViewConnector.wakeupModel(model);

		this.emit('WakeupDynamicModel', model);
	};

	this.getGridModel = function () {
		return this._gridModel;
	};

	this.getGridView = function () {
		return this._isometricView.getGridView();
	};

	this.getStaticModels = function () {
		return this._gridModel.getStaticModels();
	};

	this.getDynamicModels = function () {
		return this._modelViewConnector.getList();
	};

	this.getGridInputView = function () {
		return this._isometricView.getGridInputView();
	};

	this.getMap = function () {
		return this._gridModel.getMap();
	};

	this.setTool = function (tool) {
		this._isometricView.getGridInputView().setDragMode(!tool);
		tool && this._gridEditor.setTool(tool);
	};

	this.setBackgroundColor = function (backgroundColor) {
		this._isometricView.getGridView().setBackgroundColor(backgroundColor);
	};

	this.clear = function (dontGenerate) {
		this._gridModel.clear();
		!dontGenerate && this._gridModel.generate();
		this._modelViewConnector.clear();
		!dontGenerate && this._isometricView.startLoading();
	};

	this.putItem = function (modelType, tileX, tileY, opts) {
		var model = this._gridModel.getMap().putItem(modelType, tileX, tileY, opts);
		model && this.onAddStaticModel(model);
	};

	this.putDynamicItem = function (ctor, opts, layer) {
		var model = new ctor(
				merge(
					opts,
					{
						gridModel: this._gridModel,
					}
				)
			);

		this.onAddDynamicModel(model, layer);

		return model;
	};

	this.refreshMap = function (tileX, tileY) {
		this._isometricView.getGridView().onRefreshMap(tileX, tileY);
	};

	this.show = function () {
		this._isometricView.show();

		return this;
	};

	this.hide = function () {
		this._isometricView.hide();

		return this;
	};

	this.hideSelectedItem = function () {
		this._isometricView.getGridView().hideSelectedItem();
	};

	this.generate = function () {
		this._gridModel.generate();

		return this;
	};

	this.toJSON = function () {
		return this._gridModel.toJSON();
	};

	this.fromJSON = function (data) {
		this._gridModel.fromJSON(data);
	};
});
