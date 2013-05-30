import .TileGroup;

exports = Class(function () {
	this.init = function (opts) {
		this._groups = {};

		var tileSettings = opts.tileSettings;
		var i = tileSettings.length;
		while (i) {
			var tileSetting = tileSettings[--i];
			this.addGroup(tileSetting.group, tileSetting);
		}
	};

	this.addGroup = function (group, opts) {
		this._groups[group] = new TileGroup(opts);
	};

	this.getImage = function (tile) {
		var group = this._groups[tile.group];
		if (group) {
			return group.getImage(tile);
		}
		return false;
	};

	this.setImage = function (tileView, tile) {
		var group = this._groups[tile.group];
		if (group) {
			group.setImage(tileView, tile);
		}
		return false;
	};
});