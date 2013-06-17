Back to [isometric documentation](../readme.md).
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
 + `x {number}` ---The relative x position of the view in relation the the item position.
 + `y {number}` ---The relative y position of the view in relation the the item position.
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

Set a path to walk, the path is a list of objects with `tileX` and `tileY` values.

Parameters
 + `path {array}` ---A list of objects containing a `tileX` and `tileY` property.

__getTileX()__

Get the x-position.

Returns
 {number} ---The x-position.

__getTileY()__

Get the y-position.

Returns
 {number} ---The y-position.

__moveTo(destTileX, destTileY, x, y)__

Searches a path. The searching is done asynchronous so for long distances it might take a while.

Parameters
 + `destTileX` ---Which x-position to move to.
 + `destTileY` ---Which y-position to move to.
 + `x` ---Which x-position to move to within the tile.
 + `y` ---Which y-position to move to within the tile.

__onNewTile()__

This function can be implemented in subclasses and is called whenever the item moves from
one tile to another -as opposed to moving within a tile-.

__tick(dt)__

This function is called once every frame.

Parameters
 + `dt {number}` ---The number of milliseconds elapsed since the last invocation.

__needsSleep()__

When this function is called the link between the model is broken and the tick function will no
longer be called on the model.

The model remains in a list and can be woken up with the `wakeupModel` in the `ModelViewConnector` class.

__needsRemove()__

When this function is called the link between the model is broken and the model will be completely removed.

#### Private variables

If you subclass the `DynamicModel` class then there are several private variables which you can change to
modify the behaviour of this class, there are also a number of variables which to can read to asses the state
of the model.

__this._zIndex__

 + `_zIndex {number} = 0` ---This value is added to the calculated z-index.

__this._roadLeft__

 + `_roadLeft {number} = 0.2` ---This is the offset at which the items moves.

__this._roadRight__

 + `_roadRight {number} = 0.8` ---This is the offset at which ite item moves on the other side of the road.

__this._movedX__

 + `_movedX {number}` ---When moving left this value is -1, when moving right this value = 1 else this value = 0.

__this._movedY__

 + `_movedY {number}` ---When moving uo this value is -1, when moving down this value = 1 else this value = 0.

__this._onScreen__

 + `_onScreen {boolean}` ---This value is true when the item is visible.

Back to [isometric documentation](../readme.md).