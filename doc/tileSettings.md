Back to [isometric documentation](../readme.md).
# Tile settings

All images within the isometric grid are defined in the `tileSettings` which is an option
for the constructor of the `Isometric` class.

The tiles are devided into groups. Within each `group` there are `index` values. The `index`
is based on the part of the tile which is filled. There are three types of groups with
different `index` values:

+ Lines which use 3x3 bits.
+ Areas which use 2x2 bits.
+ Items which can use an arbritrairy index value.

## Data structure

The tile settings data structure is an array, each entry is a group and one entry can be used
the define the selection tiles used as a cursor.

### The cursor object:

 + `cursorYes {string}` ---Path to the cursor displayed if drawing is accepted.
 + `cursorNo {string}` ---Path to the cursor displayed if drawing is denied.

~~~
var tileSettings = [
	{
		cursorYes: 'resources/images/layer0/cursorYes.png',
		cursorNo: 'resources/images/layer0/cursorNo.png'
	}
];
~~~

### A group object:

 + `group {number}` ---The group identifier.
 + `images {array}` ---An array of objects representing the images of the group with the following structure:
  + `index {number}` ---The index of the image
  + `url {string|array}` ---The url or a list of urls.
  + `flipX {boolean}` ---Flip the image horizontal.
  + `flipY {boolean}` ---Flip the image vertical.
  + `blockEvents {boolean}` ---Optional, default is undefined, if false then the item can be selected.
 + `x {numner} = 0` ---Optional, the relative x-position of the image within the tile.
 + `y {number} = 0` ---Optional, the relative y-position of the image within the tile.
 + `z {array} = [0, 0]` ---Optional, first index is relative z-index in the tile, second is maximum layer z-index multiplied with this value.
 + `width {number}` ---The width of the image.
 + `height {number}` ---The height of the image.

### Tile z-index

Each tile image is assigned a z-index value ascending from the left top to the right bottom of the screen.
To control the depth sort you add a value to this default value. The z-index array of an image has two elements:
the relative z-index within a tile or the z-index of a layer.
If you have a layer which contains both moving objects and roads then you should increase the z-index values of
the items which are not flat on the ground by the maximum z value of a layer to ensure that all moving objects
are always rendered on top of the roads.

### Binairy operations

When items are drawn on the map an `or` operation is used. The `index` represends the contents of the tile.
With an `or` operation it's easy to add tiles, here's are two examples of adding 3x3 bit tiles:

<table>
	<tr>
		<td>00011100000</td>
		<td></td>
		<td><img src="demoRoad56.png" width="45" height="36"/></td>
	</tr>
	<tr>
		<td>00001001000</td>
		<td>or</td>
		<td><img src="demoRoad144.png" width="45" height="36"/></td>
	</tr>
	<tr>
		<td>00011101000</td>
		<td>=</td>
		<td><img src="demoRoad184.png" width="45" height="36"/></td>
	</tr>
</table>

<table>
	<tr>
		<td>00001100000</td>
		<td></td>
		<td><img src="demoRoad48.png" width="45" height="36"/></td>
	</tr>
	<tr>
		<td>01001001000</td>
		<td>or</td>
		<td><img src="demoRoad146.png" width="45" height="36"/></td>
	</tr>
	<tr>
		<td>01001101000</td>
		<td>=</td>
		<td><img src="demoRoad178.png" width="45" height="36"/></td>
	</tr>
</table>

Here's an example adding two 2x2 bit tiles:

<table>
	<tr>
		<td>0010</td>
		<td></td>
		<td><img src="demoGround2.png" width="45" height="36"/></td>
	</tr>
	<tr>
		<td>0101</td>
		<td>or</td>
		<td><img src="demoGround5.png" width="45" height="36"/></td>
	</tr>
	<tr>
		<td>0111</td>
		<td>=</td>
		<td><img src="demoGround7.png" width="45" height="36"/></td>
	</tr>
</table>

## 3x3 Bit index

The following table shows road tiles organized byte a 3x3 bit `index` value:

<table>
	<tr>
		<th>Image</th>
		<th>Decimal</th>
		<th>Binairy</th>
	</tr>
	<tr>
		<td><img src="demoRoad16.png" width="45" height="36"/></td>
		<td>16</td>
		<td>00001000000</td>
	</tr>
	<tr>
		<td><img src="demoRoad18.png" width="45" height="36"/></td>
		<td>18</td>
		<td>01001000000</td>
	</tr>
	<tr>
		<td><img src="demoRoad24.png" width="45" height="36"/></td>
		<td>24</td>
		<td>00011000000</td>
	</tr>
	<tr>
		<td><img src="demoRoad26.png" width="45" height="36"/></td>
		<td>26</td>
		<td>01011000000</td>
	</tr>
	<tr>
		<td><img src="demoRoad48.png" width="45" height="36"/></td>
		<td>48</td>
		<td>00001100000</td>
	</tr>
	<tr>
		<td><img src="demoRoad50.png" width="45" height="36"/></td>
		<td>50</td>
		<td>01001100000</td>
	</tr>
	<tr>
		<td><img src="demoRoad56.png" width="45" height="36"/></td>
		<td>56</td>
		<td>00011100000</td>
	</tr>
	<tr>
		<td><img src="demoRoad58.png" width="45" height="36"/></td>
		<td>58</td>
		<td>01011100000</td>
	</tr>
	<tr>
		<td><img src="demoRoad144.png" width="45" height="36"/></td>
		<td>144</td>
		<td>00001001000</td>
	</tr>
	<tr>
		<td><img src="demoRoad146.png" width="45" height="36"/></td>
		<td>146</td>
		<td>01001001000</td>
	</tr>
	<tr>
		<td><img src="demoRoad152.png" width="45" height="36"/></td>
		<td>152</td>
		<td>00011001000</td>
	</tr>
	<tr>
		<td><img src="demoRoad154.png" width="45" height="36"/></td>
		<td>154</td>
		<td>01011001000</td>
	</tr>
	<tr>
		<td><img src="demoRoad176.png" width="45" height="36"/></td>
		<td>176</td>
		<td>00001101000</td>
	</tr>
	<tr>
		<td><img src="demoRoad178.png" width="45" height="36"/></td>
		<td>178</td>
		<td>01001101000</td>
	</tr>
	<tr>
		<td><img src="demoRoad184.png" width="45" height="36"/></td>
		<td>184</td>
		<td>00011101000</td>
	</tr>
	<tr>
		<td><img src="demoRoad186.png" width="45" height="36"/></td>
		<td>186</td>
		<td>01011101000</td>
	</tr>
</table>

~~~
var tileSettings = [
	{
		group: 1,
		images: [
			{index: 16, url: 'resources/images/demoRoad16.png'},
			{index: 18, url: 'resources/images/demoRoad18.png'},
			{index: 24, url: 'resources/images/demoRoad24.png'},
			{index: 26, url: 'resources/images/demoRoad26.png'},
			{index: 48, url: 'resources/images/demoRoad48.png'},
			{index: 50, url: 'resources/images/demoRoad50.png'},
			{index: 56, url: 'resources/images/demoRoad56.png'},
			{index: 58, url: 'resources/images/demoRoad58.png'},
			{index: 144, url: 'resources/images/demoRoad144.png'},
			{index: 146, url: 'resources/images/demoRoad146.png'},
			{index: 152, url: 'resources/images/demoRoad152.png'},
			{index: 154, url: 'resources/images/demoRoad154.png'},
			{index: 176, url: 'resources/images/demoRoad176.png'},
			{index: 178, url: 'resources/images/demoRoad178.png'},
			{index: 184, url: 'resources/images/demoRoad184.png'},
			{index: 186, url: 'resources/images/demoRoad186.png'}
		],
		x: 0,
		y: 0,
		z: [0, 0],
		width: 150,
		height: 120
	},
]
~~~

## 2x2 Bit index

The following table shows road tiles organized byte a 2x2 bit `index` value:

<table>
	<tr>
		<th>Image</th>
		<th>Decimal</th>
		<th>Binairy</th>
	</tr>
	<tr>
		<td><img src="demoGround0.png" width="45" height="36"/></td>
		<td>0</td>
		<td>0000</td>
	</tr>
	<tr>
		<td><img src="demoGround1.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0001</td>
	</tr>
	<tr>
		<td><img src="demoGround2.png" width="45" height="36"/></td>
		<td>2</td>
		<td>0010</td>
	</tr>
	<tr>
		<td><img src="demoGround3.png" width="45" height="36"/></td>
		<td>3</td>
		<td>0011</td>
	</tr>
	<tr>
		<td><img src="demoGround4.png" width="45" height="36"/></td>
		<td>4</td>
		<td>0100</td>
	</tr>
	<tr>
		<td><img src="demoGround5.png" width="45" height="36"/></td>
		<td>5</td>
		<td>0101</td>
	</tr>
	<tr>
		<td><img src="demoGround6.png" width="45" height="36"/></td>
		<td>6</td>
		<td>0110</td>
	</tr>
	<tr>
		<td><img src="demoGround7.png" width="45" height="36"/></td>
		<td>7</td>
		<td>0111</td>
	</tr>
	<tr>
		<td><img src="demoGround8.png" width="45" height="36"/></td>
		<td>8</td>
		<td>1000</td>
	</tr>
	<tr>
		<td><img src="demoGround9.png" width="45" height="36"/></td>
		<td>9</td>
		<td>1001</td>
	</tr>
	<tr>
		<td><img src="demoGround10.png" width="45" height="36"/></td>
		<td>10</td>
		<td>1010</td>
	</tr>
	<tr>
		<td><img src="demoGround11.png" width="45" height="36"/></td>
		<td>11</td>
		<td>1011</td>
	</tr>
	<tr>
		<td><img src="demoGround12.png" width="45" height="36"/></td>
		<td>12</td>
		<td>1100</td>
	</tr>
	<tr>
		<td><img src="demoGround13.png" width="45" height="36"/></td>
		<td>13</td>
		<td>1101</td>
	</tr>
	<tr>
		<td><img src="demoGround14.png" width="45" height="36"/></td>
		<td>14</td>
		<td>1110</td>
	</tr>
	<tr>
		<td><img src="demoGround15.png" width="45" height="36"/></td>
		<td>15</td>
		<td>1111</td>
	</tr>
</table>

~~~
var tileSettings = [
	{
		group: 1,
		images: [
			{index: 0, url: 'resources/images/demoGround0.png'},
			{index: 1, url: 'resources/images/demoGround0.png'},
			{index: 2, url: 'resources/images/demoGround0.png'},
			{index: 3, url: 'resources/images/demoGround0.png'},
			{index: 4, url: 'resources/images/demoGround0.png'},
			{index: 5, url: 'resources/images/demoGround0.png'},
			{index: 6, url: 'resources/images/demoGround0.png'},
			{index: 7, url: 'resources/images/demoGround0.png'},
			{index: 8, url: 'resources/images/demoGround0.png'},
			{index: 9, url: 'resources/images/demoGround0.png'},
			{index: 10, url: 'resources/images/demoGround0.png'},
			{index: 11, url: 'resources/images/demoGround0.png'},
			{index: 12, url: 'resources/images/demoGround0.png'},
			{index: 13, url: 'resources/images/demoGround0.png'},
			{index: 14, url: 'resources/images/demoGround0.png'},
			{index: 15, url: 'resources/images/demoGround0.png'}
		],
		x: 0,
		y: 0,
		z: [0, 0],
		width: 150,
		height: 120
	},
]
~~~

Back to [isometric documentation](../readme.md).