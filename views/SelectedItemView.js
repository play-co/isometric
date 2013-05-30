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

		this.style.visible = false;
	};

	this.setView = function (view, offsetX, offsetY) {
		var style = this.style;

		style.x = offsetX + view.style.x - 10;
		style.y = offsetY + view.style.y - 10;
		style.width = view.style.width + 20;
		style.height = view.style.height + 20;
		style.visible = true;
	};

	this.render = function (ctx) {
		var style = this.style;
		var width = style.width;
		var height = style.height;
		var lineWidth = 5;

		ctx.fillStyle = '#404040';
		ctx.fillRect(0, 0, width, lineWidth);
		ctx.fillRect(0, lineWidth, lineWidth, height - lineWidth * 2);
		ctx.fillRect(width - lineWidth, lineWidth, lineWidth, height - lineWidth * 2);
		ctx.fillRect(0, height - lineWidth, width, lineWidth);
	};
});