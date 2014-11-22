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
import ui.resource.Image as Image;

exports = Class(function () {
	this.init = function (opts) {
		this._images = {};

		var prefix = opts.prefix;
		var images = opts.images || [];
		var miniMapLayer = opts.miniMapLayer;

		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			var index = image.index;
			var url = image.url;

			if (isArray(url)) {
				var list = [];
				for (var j = 0; j < url.length; j++) {
					list.push(new Image({url: url[j]}));
				}
				this._images[index] = list;
			} else if (url) {
				this._images[index] = new Image({url: url});
			} else {
				this._images[index] = null;
			}

			if (this._images[index]) {
				this._images[index].selectable = !!image.selectable;
				this._images[index].flipX = !!image.flipX;
				this._images[index].flipY = !!image.flipY;
				this._images[index].miniMapLayer = miniMapLayer;
			}
		}
	};

	this.setImage = function (tileView, tile) {
		var result = false;
		var image = this._images[tile.index];

		if (image) {
			if (isArray(image)) {
				if (image[tile.randomIndex]) {
					image = image[tile.randomIndex];
					tileView.setImage(image);
				}
			} else {
				tileView.setImage(image);
			}

			tileView.style.flipX = image.flipX;
			tileView.style.flipY = image.flipY;
			if (image.selectable) {
				if (!image.clickRect) {
					var map = image.getMap();
					var scaleX = tileView.style.width / (map.marginLeft + map.width + map.marginRight);
					var scaleY = tileView.style.height / (map.marginTop + map.height + map.marginBottom);

					image.clickRect = {
						x: map.marginLeft * scaleX,
						y: map.marginTop * scaleY,
						width: map.width * scaleX,
						height: map.height * scaleY
					};
				}
				result = image.clickRect;
			}
		} else {
			tileView.style.visible = false;			
		}

		return result;
	};

	this.getImage = function (tile) {
		var image = this._images[tile.index];
		if (image) {
			return isArray(image) ? image[tile.randomIndex] : image;
		}

		return false;
	};
});