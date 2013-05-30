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
		var images = opts.images;

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
				this._images[index].blockEvents = !!image.blockEvents;
				this._images[index].flipX = !!image.flipX;
				this._images[index].flipY = !!image.flipY;
			}
		}

		this._defaultImage = opts.defaultImage ? new Image({url: opts.defaultImage}) : false;
	};

	this.setImage = function (tileView, tile) {
		var image = this._images[tile.index];
		if (image) {
			if (isArray(image)) {
				if (image[tile.randomIndex]) {
					tileView.setImage(image[tile.randomIndex]);
				}
			} else {
				tileView.setImage(image);
			}
			tileView.style.flipX = image.flipX;
			tileView.style.flipY = image.flipY;
			tileView.__input.blockEvents = image.blockEvents;
		} else {
			tileView.style.visible = false;			
		}
	};

	this.getImage = function (tile) {
		var image = this._images[tile.index];
		if (image) {
			return isArray(image) ? image[0] : image;
		}

		return false;
	};
});