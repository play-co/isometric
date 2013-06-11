Back to [isometric documentation](readme.md).

# Item settings

The isometric engine provides a generic view for displaying dynamic (moving) items on the grid.

See [`grid settings`](grid.md) for details on how to setup a layer for displaying dynamic items.

The `ItemView` class is located in `isometric.views.item.ItemView`.

Whenever a dynamic item is created the engine check if the item is visible. If the item is visible
and there's no view attached then a new view is obtained and attached to the model. When the item
moves of screen then the item breaks the link between the model and the view and release the view.

## Data structure

The `itemSettings` data structure is an object, each key in the object contains a configuration for
displaying an item.

 + `width {number}` ---The width of the view.
 + `height {number}` ---The height of the view.
 + `color {string}` ---Optional, The background color of the view.
 + `offsetX {number}` ---The relative x position of the view in relation the the item position.
 + `offsetY {number}` ---The relative y position of the view in relation the the item position.
 + `images {array}` ---A list of images which can be displayed, if images are set then the color is ignored.

## DynamicModel Class

The `DynamicModel` class is the base class for all items which don't have a fixed position on the grid.

Parameters:

 + `tileX {number} = 0` ---Optional, the x-position of the item.
 + `tileY {number} = 0` ---Optional, the y-position of the item.
 + `x {numner} = 0.5` ---Optional, the x-position of the item within the tile in the range of 0..1.
 + `y {numner} = 0.5` ---Optional, the y-position of the item within the tile in the range of 0..1.

#### Methods

__getOpts()__

Get the options which contain the current settings of the item.

Returns
 {object} ---Returns the opts.

__setPos(x, y)__

Set the position of the item within the tile, valid values are in the range of 0..1.

Parameters
 + `x {number}` ---The x-position within the tile.
 + `y {number}` ---The y-position within the tile.

__setPath(path)__

Set a path to walk, the path is a list of object with x and y values.

Back to [isometric documentation](readme.md).