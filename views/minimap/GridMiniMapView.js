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
import ui.View as View;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridMiniMapBuffer = opts.gridMiniMapBuffer;
	};

	this.render = function (ctx) {
		if (!this._gridMiniMapBuffer) {
			return;
		}
		var canvas = this._gridMiniMapBuffer.getCanvas();
		if (!canvas) {
			return;
		}

		var viewport = this._gridMiniMapBuffer.getViewport();
		var y = viewport.y;
		for (var i = 0; i < 2; i++) {
			ctx.drawImage(
				canvas,
				viewport.x, y, viewport.w, viewport.h,
				0, 0, this.style.width, this.style.height
			);
			y += 512;
		}

		var view = this._gridMiniMapBuffer.getView(this.style.width, this.style.height);
	};

	this.setGridMiniMapBuffer = function (gridMiniMapBuffer) {
		this._gridMiniMapBuffer = gridMiniMapBuffer;
	};

	this.onInputStart = function (evt) {
	};
});