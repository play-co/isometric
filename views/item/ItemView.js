import ui.View as View;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				width: 20,
				height: 20,
				backgroundColor: 'red'
			}
		);
		supr(this, 'init', [opts]);
	};

	this.create = function (opts, tileOnScreen) {
	};

	this.onUpdate = function (opts) {
	};

	this.setTileOnScreen = function (opts, tileOnScreen) {
		this.style.x = tileOnScreen.x - 10;
		this.style.y = tileOnScreen.y - 10;
		this.style.visible = true;
	};
});