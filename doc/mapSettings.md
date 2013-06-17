Back to [isometric documentation](../readme.md).
# Map settings

The map settings can be used to generate a landscape, randomize tiles and set
rules for adding tiles. The `mapSettings` property is an optional constructor option 
for the `Isometric` class.

The `group` and `index` refer to tile images which are defined in the `tileSettings`.

## Data structure

 + `rules {array}` ---Optional, rules for replacing tiles.
  + `ag {number}` ---Value of the group on the map.
  + `ai {number}` ---Value of the index on the map.
  + `bg {number}` ---The group to be drawn on the map.
  + `bi {numner}` ---The index to be drawn on the map.
  + `rg {number}` ---The resulting group.
  + `ri {number}` ---The resulting index.
 + `generatorSteps {array}` ---Optional.
  + `stepsPerFrame {number}` ---How many steps per frame to apply when creating the map.
  + `type {string}` ---The type of step: 'rectangles' or 'fill'.
  + `layer {number} = 0` ---Which layer to draw to.
  + `repeat {number}` ---If type is `rectangles` then this defines how many rectangles.
  + `count {number}` ---If type is `rectangles` then this defines how long a chain of rectangles will be.
  + `firstRectangle {object}` ---Optional, if the the type is `rectangles` then this is the first rectangle with the properties:
   + `x {number}` ---The x-position of the rectangle.
   + `y {number}` ---The y-position of the rectangle.
   + `w {number}` ---The width of the rectangle.
   + `h {number}` ---The height of the rectangle.
  + `group {number}` ---The group to render.
  + `index {number}` ---The index of the tile to render, is only used when the type is 'fill'.
  + `chance {number}` ---A value between 0 and 1, the chance the tile is set, only used when the type is 'fill'.
  + `accept {number}` ---The rules for accepting map changes. See Drawing rules
 + `randomTiles`
  + `group {number}` ---The group to apply the randomization to.
  + `index {numner}` ---The index within the group to randomize.
  + `chances {array}` ---An array of numbers, the sum of which sould be 1. See below for more details.

## Rules

Every time a tile is drawn on the map using a method like `Map.drawRect`, `drawLineHorizontal`,
`drawLineVertical` or `drawTile` the rules are checked. If there is a rule for the existing tile 
on the map combined with the new value then the result value of the rule will be used.

The following rule states that if there is an tile with `group` 1, `index` 146 on the map and a tile
with `group` 2, `index` 56 is drawn on it the resulting tile on the map will be `group` 1, `index` 255:
~~~
var mapSettings = {
	rules: [
		{ag: 1, ai: 146, bg: 2, bi: 56, rg: 1, ri: 255},
	]
};
~~~

## Generator steps

The map generator creates random patterns of tiles or items on the map. The generator steps
define wich type of pattern to draw.

The following `mapSettings` create 20 chains of rectangles on layer 0 of the map:
~~~
var mapSettings = {
		generatorSteps: [
			{
				type: 'rectangles',
				repeat: 1000,
				count: 50,
				group: 1, // The group defined in the tile settings
				accept: [
					{
						// Accept tiles 0..15 from group 1 on layer 0:
						layer: 0,
						group: 1,
						tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
					}
				]
			}
		]
	};
~~~

The following `mapSettings` creates 200 items on layer 0 of the map.

~~~
var mapSettings = {
		generatorSteps: [
			{
				type: 'fill',
				stepsPerFrame: 200,
				repeat: 200,
				layer: 0,
				group: 1, // The group defined in the tile settings
				index: 1, // The index defined in the tile settings
				chance: 0.1,
				accept: [
					{
						layer: 0,
						group: 2,
						tiles: [0]
					}
				]
			}
		]
	};
~~~

## Random tiles

For each `index` within a `group` a number of random alternatives can be defined.
If the given `index` of the `group` is drawn on the map then a random image is used.

To explain the randomization we need a some `tileSetting` data:
You can read more about the `tileSettings` here.
~~~
var tileSettings = [
	{
		group: 1,
		images: [
			{
				index: 0,
				url: ['a.png', 'b.png', 'c.png']
			}
		]
	}
]
~~~

The following map setting randomizes the tile of `group` `, `index` 0. Whenever a tile
of this `group` and `index` is drawn there's a 85% chance of 'a.png', a 10% chance of
'b.png' and a 5% chance of 'c.png'.
~~~
var mapSettings = {
	randomTiles: [
		{
			group: 1,
			index: 0,
			chances: [0.85, 0.1, 0.05]
		}
	]
}
~~~

Back to [isometric documentation](../readme.md).