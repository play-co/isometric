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

		this._itemSettings = opts.itemSettings;
	};

	this.create = function (opts, tileOnScreen) {
		this.style.visible = false;
		this._item = opts.item;
	};

	this.onUpdate = function (opts) {
		var itemSetting = this._itemSettings[this._item];

		if (itemSetting) {
			if (itemSetting.color) {
				this.style.backgroundColor = itemSetting.color;
			}
		}
		this.style.visible = opts.visible;
	};

	this.setTileOnScreen = function (opts, tileOnScreen) {
		this.style.x = tileOnScreen.x - 8;
		this.style.y = tileOnScreen.y - 40;
		this.style.zIndex = tileOnScreen.z;
	};
});