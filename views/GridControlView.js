import lib.Enum as Enum;

import ui.View as View;
import ui.TextView as TextView;

var inputModes = Enum(
		'BUTTON',
		'DRAG'
	);

exports = Class(View, function (supr) {
	this.init = function (opts) {
		var opts = merge(
				opts,
				{
					x: 0,
					y: 0,
					width: GC.app.baseWidth,
					height: GC.app.baseHeight
				}
			);
		supr(this, 'init', [opts]);

		var size = this.style.width * 0.1;
		var sizeX = [size, this.style.width - size * 2, size];
		var sizeY = [size, this.style.height - size * 2, size];

		this._gridView = opts.gridView;

		this._downIndexStart = -1;
		this._downIndex = -1;

		this._dragMode = true;
		this._dragPointCount = 0;
		this._dragPointFirst = null;
		this._dragPoints = {};
		this._dragPointIndex = [];
		this._dragInitialDistance = null;
		this._dragInitialScale = null;

		this._lastScale = null;
	};

	this.onInputStart = function (evt) {
		var index = 'p' + evt.id;
		this.emit('SelectCancel');

		this._dragPoints[index] = {x: evt.srcPoint.x, y: evt.srcPoint.y};
		this._dragPointIndex[this._dragPointCount] = index;

		if (this._dragPointCount === 0) {
			this._dragPointFirst = index;

			if (!this._dragMode) {
				var scale = GC.app.scale * this._gridView.getScale();
				this.emit('Start', 5, {x: this._dragPoints[index].x / scale, y: this._dragPoints[index].y / scale});
			}
		}

		this._dragInitialDistance = null;
		this._dragPointCount++;
	};

	this.onInputMove = function (evt) {
		if (this._dragPointCount === 0) {
			return;
		}

		var x = this._dragPoints[this._dragPointFirst].x;
		var y = this._dragPoints[this._dragPointFirst].y;
		var scale = GC.app.scale * this._gridView.getScale();
		var index = 'p' + evt.id;
		var point = this._dragPoints[index];

		point.x = evt.srcPoint.x;
		point.y = evt.srcPoint.y;

		if (index === this._dragPointFirst) {
			this._dragPoints[index].x = point.x;
			this._dragPoints[index].y = point.y;
		}

		if (this._dragPointCount === 2) {
			var p1 = this._dragPoints[this._dragPointIndex[0]];
			var p2 = this._dragPoints[this._dragPointIndex[1]];
			var dx = p2.x - p1.x;
			var dy = p2.y - p1.y;
			var d = Math.sqrt(dx * dx + dy * dy) * GC.app.scale;

			if (this._dragInitialDistance === null) {
				this._dragInitialDistance = d;
				this._dragInitialScale = this._gridView.getScale();
				this._lastScale = null;
			} else {
				scale = (d / this._dragInitialDistance * 100) | 0;
				if (this._lastScale !== scale) {
					this._lastScale = scale;
					this.emit('Pinch', this._dragInitialScale * scale / 100);
				}
			}
		} else if (this._dragMode) {
			if (this._dragPointFirst === index) {
				this.emit('Drag', (x - point.x) / scale, (y - point.y) / scale);
			}
		} else {
			this.emit('Select', 5, {x: point.x / scale, y: point.y / scale});
		}
	};

	this.onInputSelect = function () {
		this.emit('End');
		this._dragPointCount = Math.max(this._dragPointCount - 1, 0);
	};

	this.onInputOut = function () {
		this.emit('End');
		this._dragPointCount = Math.max(this._dragPointCount - 1, 0);
	};

	this.setDragMode = function (dragMode) {
		this._dragMode = dragMode;
	};
});