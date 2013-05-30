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
import ui.TextView as TextView;

import menus.views.components.ButtonView as ButtonView;

import .GridView as GridView;
import .GridInputView as GridInputView;

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
			gridSettings: opts.gridSettings,
			itemSettings: opts.itemSettings,
			tileSettings: opts.tileSettings,
			particleSettings: opts.particleSettings,
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
		this._gridInputView = new GridInputView({
			superview: this,
			gridView: this._gridView
		});
	};

	this.getGridView = function () {
		return this._gridView;
	};

	this.getGridInputView = function () {
		return this._gridInputView;
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