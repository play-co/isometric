import lib.Enum as Enum;
import event.Emitter as Emitter;

var sides = Enum(
		'LEFT_UP',
		'UP',
		'RIGHT_UP',
		'LEFT',
		'CENTER',
		'RIGHT',
		'LEFT_DOWN',
		'DOWN',
		'RIGHT_DOWN'
	);

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridModel = opts.gridModel;
		this._sideIndex = -1;
		this._startPoint = null;

		this._speed = 200;
	};

	this.onStart = function (index, point) {
		if (index === sides.CENTER) {
			this._startPoint = this._gridModel.pointToGrid(point);
			this._gridModel.setCursor(this._startPoint);
			this._gridModel.setSelection(this._startPoint, this._startPoint);
		} else {
			this._sideIndex = index;
		}
	};

	this.onSelect = function (index, point) {
		var startPoint = this._startPoint;

		if (startPoint && (index === sides.CENTER)) {
			this._gridModel.setSelection(startPoint, this._gridModel.pointToGrid(point));
		}
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
		this._speed = 200;
		this._actualSpeed = false;
	};

	this.onDrag = function (x, y) {
		var gridModel = this._gridModel;
		if (x < 0) {
			gridModel.scrollLeft(-x);
		} else {
			gridModel.scrollRight(x);
		}
		if (y < 0) {
			gridModel.scrollUp(-y);
		} else {
			gridModel.scrollDown(y);
		}
	};

	this.tick = function (dt) {
		dt /= 1000;

		if (this._sideIndex !== -1) {
			var speed = this._speed * dt;
			this._speed = Math.min(this._speed * (1 + dt * 1), 600);

			if (this._actualSpeed) {
				this._actualSpeed = this._actualSpeed * 0.7 + speed * 0.3;
			} else {
				this._actualSpeed = speed;
			}
			speed = this._actualSpeed;
		}

		switch (this._sideIndex) {
			case sides.LEFT_UP:
				this._gridModel.scrollLeft(speed);
				this._gridModel.scrollUp(speed);
				break;

			case sides.UP:
				this._gridModel.scrollUp(speed);
				break;

			case sides.RIGHT_UP:
				this._gridModel.scrollRight(speed);
				this._gridModel.scrollUp(speed);
				break;

			case sides.LEFT:
				this._gridModel.scrollLeft(speed);
				break;

			case sides.RIGHT:
				this._gridModel.scrollRight(speed);
				break;

			case sides.LEFT_DOWN:
				this._gridModel.scrollLeft(speed);
				this._gridModel.scrollDown(speed);
				break;

			case sides.DOWN:
				this._gridModel.scrollDown(speed);
				break;

			case sides.RIGHT_DOWN:
				this._gridModel.scrollRight(speed);
				this._gridModel.scrollDown(speed);
				break;
		}
	};
});