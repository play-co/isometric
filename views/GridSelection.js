import ui.ImageView as ImageView;

import ui.resource.Image as Image;

import .ViewPool;

var cursorYes = new Image({url: 'resources/images/cursorYes.png'});
var cursorNo = new Image({url: 'resources/images/cursorNo.png'});

exports = Class(ViewPool, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				initCount: 100,
				ctor: ImageView,
				tag: 'Selection',
				initOpts: {
					superview: opts.superview,
					image: cursorYes
				}
			}
		);

		supr(this, 'init', [opts]);

		this._gridView = opts.gridView;
		this._tileWidth = this._gridView.getTileWidth();
		this._tileHeight = this._gridView.getTileHeight();
	};

	this.show = function (data, offsetX, offsetY) {
		var startPoint = data.selection.startPoint;
		var endPoint = data.selection.endPoint;
		var minX = Math.min(startPoint.x, endPoint.x);
		var maxX = Math.max(startPoint.x, endPoint.x);
		var minY = Math.min(startPoint.y, endPoint.y);
		var maxY = Math.max(startPoint.y, endPoint.y);

		if (maxX - minX > data.gridWidth * 0.5) {
			var m = maxX;
			maxX = minX;
			minX = m - data.gridWidth;
		}
		if (maxY - minY > data.gridHeight * 0.5) {
			var m = maxY;
			maxY = minY;
			minY = m - data.gridHeight;
		}

		var views = this._views;
		var count = 0;
		var image = data.selection.accept ? cursorYes : cursorNo;
		for (y = minY; y <= maxY; y++) {
			for (x = minX; x <= maxX; x++) {
				var point = this._gridView.gridToPoint(data, {x: x, y: y});
				if (point) {
					(this._freshViewIndex <= count) && this.obtainView();

					var view = views[count];
					var style = view.style;

					view.setImage(image);

					style.width = this._tileWidth;
					style.height = this._tileHeight;
					style.x = point.x - offsetX;
					style.y = point.y - offsetY;
					style.zIndex = 999999;
					style.visible = true;

					count++;
				}
			}
		}

		while (this._freshViewIndex > count) {
			this.releaseView(views[this._freshViewIndex - 1]);
		}
	};

	this.clear = function () {
		this._freshViewIndex && this.releaseAllViews();
	};
});