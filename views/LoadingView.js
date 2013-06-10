import ui.TextView as TextView;

exports = Class(TextView, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				backgroundColor: '#000066',
				text: 'Building world',
				color: '#FFFFFF',
				size: 36
			}
		);
		supr(this, 'init', [opts]);
	};

	this.start = function () {
		this.style.visible = true;
		this.setText('Building world 0%');
	};

	this.setProgress = function (progress) {
		this.setText('Building world ' + progress + '%');
	};
});
