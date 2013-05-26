import ui.View as View;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				width: 16,
				height: 40,
				backgroundColor: 'red'
			}
		);
		supr(this, 'init', [opts]);
	};

	this.create = function (opts, tileOnScreen) {
		this.style.visible = false;
	};

	this.onUpdate = function (opts) {
		this.style.visible = opts.visible;
	};

	this.setTileOnScreen = function (opts, tileOnScreen) {
		this.style.x = tileOnScreen.x - 8;
		this.style.y = tileOnScreen.y - 40;
		this.style.zIndex = tileOnScreen.z;
	};
});