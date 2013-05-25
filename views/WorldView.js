import ui.View as View;
import ui.TextView as TextView;

import menus.views.components.ButtonView as ButtonView;

import src.views.GridView as GridView;
import src.views.GridControlView as GridControlView;

import src.settings.tileSettings as tileSettings;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				x: 0,
				y: 0,
				width: GC.app.baseWidth,
				height: GC.app.baseHeight
			}
		);
		supr(this, 'init', arguments);

		this._gridView = new GridView({
			superview: this,
			tileSettings: tileSettings,
			tileWidth: 150,
			tileHeight: ~~(150 * 0.8),
			visible: false
		});
		this._gridView.
			on('Populated', bind(this, 'onPopulated')).
			on('ChangeOffset', bind(this, 'emit', 'ChangeOffset'));

		this._loadingView = new TextView({
			superview: this,
			x: 0,
			y: 0,
			width: GC.app.baseWidth,
			height: GC.app.baseHeight,
			backgroundColor: '#000066',
			text: 'Building world',
			color: '#FFFFFF',
			size: 36
		});
		this._gridControlView = new GridControlView({
			superview: this,
			gridView: this._gridView
		});
	};

	this.getGridView = function () {
		return this._gridView;
	};

	this.getGridControlView = function () {
		return this._gridControlView;
	};

	this.setProgress = function (progress) {
		this._loadingView.setText('Building world ' + progress + '%');
	};

	this.onPopulated = function () {
		this._gridView.style.visible = true;
		this._loadingView.style.visible = false;
	};

	this.startLoading = function () {
		this._loadingView.setText('Building world 0%');
		this._loadingView.style.visible = true;
		this._gridView.style.visible = false;
		this._gridView.onRefreshMap();
	};
});