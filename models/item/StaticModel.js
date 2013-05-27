import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._x = opts.x;
		this._y = opts.y;
		this._width = opts.width;
		this._height = opts.height;

		this._gridModel = opts.gridModel;
		this._map = this._gridModel.getMap();

		this._layer = opts.layer;
		this._group = opts.group;
		this._index = opts.index;

		this._surrounding = opts.surrounding;

		this.onUpdateMap();
	};

	this.getX = function () {
		return this._x;
	};

	this.getY = function () {
		return this._y;
	};

	this.getGroup = function () {
		return this._group;
	};

	this.getIndex = function () {
		return this._index;
	};

	/**
	 * This function is called when a tile next to the item changes.
	 */
	this.onUpdateMap = function () {
	};

	this.tick = function (dt) {
	};
});