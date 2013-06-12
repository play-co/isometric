/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */
import ui.ImageView as ImageView;

import ui.resource.Image as Image;

import .ViewPool;

exports = Class(ViewPool, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				initCount: 100,
				ctor: ImageView,
				tag: 'Selection',
				initOpts: {
					superview: opts.superview
				}
			}
		);

		supr(this, 'init', [opts]);

		var tileSettings = opts.tileSettings;
		var i = tileSettings.length;
		while (i) {
			var tileSetting = tileSettings[--i];
			if (tileSetting.cursorYes && tileSetting.cursorNo) {
				this._cursorYes = new Image({url: tileSetting.cursorYes});
				this._cursorNo = new Image({url: tileSetting.cursorNo});
				break;
			}
		}

		this._gridView = opts.gridView;
		this._tileWidth = this._gridView.getTileWidth();
		this._tileHeight = this._gridView.getTileHeight();
	};

	this.show = function (data, offsetX, offsetY) {
		var startPoint = data.selection.startPoint;
		var endPoint = data.selection.endPoint;
		var minX = Math.min(startPoint.tileX, endPoint.tileX);
		var maxX = Math.max(startPoint.tileX, endPoint.tileX);
		var minY = Math.min(startPoint.tileY, endPoint.tileY);
		var maxY = Math.max(startPoint.tileY, endPoint.tileY);

		if (maxX - minX > data.width * 0.5) {
			var m = maxX;
			maxX = minX;
			minX = m - data.width;
		}
		if (maxY - minY > data.height * 0.5) {
			var m = maxY;
			maxY = minY;
			minY = m - data.height;
		}

		var views = this._views;
		var count = 0;
		var image = data.selection.accept ? this._cursorYes : this._cursorNo;
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