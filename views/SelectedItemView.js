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