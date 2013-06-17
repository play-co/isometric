Back to [isometric documentation](../readme.md).
# Editor settings

The editor settings object defines a number of tools for modifying the grid.
There are three types of tools:

+ Item
+ Line
+ Area

## Data structure

Eech key in the `editorSettings` object represent a tool for modifying the grid.

 + `type {string}` ---The type of tool, possible values are: 'item', 'line' or 'area'.
 + `layer {number}` ---The layer affected by this tool, has to be within the range of the layers defined in the [`gridSettings`](grid.md).
 + `group {numner}` ---The group to use for drawing on the map.
 + `index {number} = 0` ---The index within the group.
 + `model {class}` ---Optional, a model constructor for this tile.
 + `modelOpts {object}` ---Optional, the options to pass to the constructor of the model.
 + `tileSet {array|object}` ---The bits to apply when drawing, see below for more details.
 + `minWidth {number)` ---The minimal width of the selected area which is accepted.
 + `minHeight {number)` ---The minimal height of the selected area which is accepted.
 + `conditions {object}` ---Conditions for modifying the grid, see [`conditions`](conditions.md) for more details.
 + `updater {function (map, tool, rect)}` ---Optional, a function called after modifying the grid.

## Tile sets

If a line or area is drawn on the map then the bits to set have to be configured, the line and area types have a different data structure:

A tile set for drawing areas:
~~~
var tileSet = [
		[8, 12, 4],
		[10, 15, 5],
		[2, 3, 1]
	];
~~~

A tile set for drawing lines:
~~~
var tileSet = {
		horizontal: [24, 56, 48],
		vertical: [18, 146, 144]
	};
~~~

For a visual representation and more details about these values see: [`tileSettings`](tileSettings.md).

An example setting for drawing roads on the grid, the line update merged adjacent lines and line caps.
~~~
var editorSettings = {
		road: {
			type: 'line',
			layer: 1,
			group: 2, // The group defined in the tile settings
			tileSet: {
				horizontal: [24, 56, 48],
				vertical: [18, 146, 144]
			},
			updater: lineUpdater
		}
	};
~~~

An example for drawing areas on the grid:
~~~
var editorSettings = {
		green: {
			type: 'area',
			layer: 1,
			group: gameConstants.tileGroups.GREEN,
			tileSet: [
				[8, 12, 4],
				[10, 15, 5],
				[2, 3, 1]
			],
			minWidth: 2,
			minHeight: 2
		}
	};
~~~

An example for adding an item with a constructor to the gird;
~~~
var editorSettings = {
	box: {
		type: 'item',
		model: BoxModel,
		layer: 1,
		group: 2
	}
};
~~~

Back to [isometric documentation](../readme.md).