import ui.ViewPool as ViewPool;

exports = Class(ViewPool, function (supr) {
	this.getViews = function () {
		return this._views;
	};

	this.getLength = function () {
		return this._freshViewIndex;
	};
}); 