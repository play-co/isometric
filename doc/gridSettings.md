Back to [isometric documentation](../readme.md).
# Grid settings

The grid settings contain the most fundamental properties of the grid like the size of the grid,
size of the tiles and the layers.

## Overdraw, underdraw

If you would start drawing at (0, 0) the view would not be fully covered because each tile has
a diamond shaped area which is filled. So starting at (0, 0) would leave triangles on the top
and the left of the screen which are not covered.
If there are items on the grid which exceed the horizontal or vertical size of a single tile then
those items have to appear before the tile on which they reside is actually visible.
To configure the grid to handle these situations properly the overdraw and underdraw values can
be configured.

## Layers, dynamic views, particles systems

It's possible to create items which move on the grid, since these items don't have a fixed location
a `ViewPool` for these items has to be created. The number of views in this pool must be passed as 
a property for the layer.

## Data structure

 + `tileWidth {number}` ---The width of a tile.
 + `tileHeight {number}` ---The height of tile.
 + `width {number} = 64` ---Optional, the width of the grid.
 + `height {numner} = 64` ---Optional, the height of the grid.
 + `underDrawX {number} = 2` ---Optional, extra tiles drawn to fully cover the view.
 + `underDrawY {number} = 2` ---Optional, extra tiles drawn to fully cover the view.
 + `overDrawX {number} = 2` ---Optional, extra tiles drawn to fully cover the view.
 + `overDrawY {number} = 3` ---Optional, extra tiles drawn to fully cover the view.
 + `layers {array}` ---An array of objects defining number of layers and the properties for the layers with the following structure:
  + `dynamicViews {number} = 0` ---Optional, the number of dynamic views on the layer.
  + `particleSystems {number} = 0` ---Optional, the number of particle systems on the layer.
  + `particleStytemSize {number} = 0` ---Optional, the number if particles in each particle system on the layer.
  + `overDrawY {number} = 3` ---Optional, the bottom-vertical overdraw for the layer.
  + `selectionLayer {boolean}` ---Optional, designates this layer as the one on which the selection will appear.  Defaults to first layer (0).

~~~
var gridSettings = {
	tileWidth: 150,
	tileHeight: ~~(150 * 0.8),

	width: 64,
	height: 64,

	underDrawX: 2,
	underDrawY: 2,
	overDrawX: 1,
	overDrawY: 5,

	layers: [
		{
			dynamicViews: 0,
			particleSystems: 0,
			particleSystemSize: 0,
			overDrawY: 3
		},
		{
			selectionLayer: true
		},
		{
			dynamicViews: 30,
			particleSystems: 10,
			particleSystemSize: 50
		}
	]
}
~~~

Back to [isometric documentation](../readme.md).
