import lib.Enum as Enum;
import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridModel = opts.gridModel;
		this._startPoint = null;
	};

	this.onStart = function (index, point) {
		this._startPoint = this._gridModel.pointToGrid(point);
		this._gridModel.setCursor(this._startPoint);
		this._gridModel.setSelection(this._startPoint, this._startPoint);
	};

	this.onSelect = function (index, point) {
		var startPoint = this._startPoint;

		this._gridModel.setSelection(startPoint, this._gridModel.pointToGrid(point));
	};

	this.onSelectCancel = function () {
		this._gridModel.clearSelection();
	};

	this.onEnd = function (index) {
		var selection = this._gridModel.getSelection();
		selection && selection.accept && this.emit('Selection', selection);

		this._gridModel.clearSelection();
		this._gridModel.setCursor(false);
		this._sideIndex = -1;
		this._startPoint = null;
	};

	this.onDrag = function (x, y) {
		var gridModel = this._gridModel;
		(x < 0) ? gridModel.scrollLeft(-x) : gridModel.scrollRight(x);
		(y < 0) ? gridModel.scrollUp(-y) : gridModel.scrollDown(y);
	};
});