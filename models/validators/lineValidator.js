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
function checkSurrounding (map, layer, tileX, tileY, surrounding, fromGroup) {
	var tile = map.getTile(x, y)[layer];
	var i = surrounding.length;

	while (i) {
		var s = surrounding[--i];
		var neighbour = map.getTile(tileX + s.tileX, tileY + s.tileY)[layer];

		if ((neighbour.group === fromGroup) && ((neighbour.index & 16) === 16)) {
			tile.index |= 1 << s.b1;
			neighbour.index |= 1 << s.b2;
		}
	}
}

exports = function (map, tool, rect, fromGroup) {
	var tileX = rect.x;
	var tileY = rect.y;
	var width = rect.w;
	var height = rect.h;
	var neighbour;
	var tile;
	var layer = tool.layer;

	fromGroup = fromGroup || tool.group;

	if (width > height) {
		checkSurrounding(
			map, layer, tileX, tileY,
			[
				{tileX: -1, tileY: 0, b1: 5, b2: 3},
				{tileX: 0, tileY: -1, b1: 7, b2: 1},
				{tileX: 0, tileY: 1, b1: 1, b2: 7}
			],
			fromGroup
		);
		checkSurrounding(
			map, layer, tileX + width - 1, tileY,
			[
				{tileX: 1, tileY: 0, b1: 3, b2: 5},
				{tileX: 0, tileY: -1, b1: 7, b2: 1},
				{tileX: 0, tileY: 1, b1: 1, b2: 7}
			],
			fromGroup
		);

		for (var i = 0; i < width; i++) {
			tile = map.getTile(tileX + i, tileY)[layer];
			neighbour = map.getTile(tileX + i, tileY - 1)[layer];
			if ((neighbour.group === fromGroup) && ((neighbour.index & 16) === 16)) {
				if ((neighbour.index & 56) !== 56) {
					neighbour.index |= 1 << 1;
					tile.index |= 1 << 7;
				}
			}

			neighbour = map.getTile(tileX + i, tileY + 1)[layer];
			if ((neighbour.group === fromGroup) && ((neighbour.index & 16) === 16)) {
				if ((neighbour.index & 56) !== 56) {
					neighbour.index |= 1 << 7;
					tile.index |= 1 << 1;
				}
			}
		}
	} else {
		checkSurrounding(
			map, layer, tileX, tileY,
			[
				{tileX: -1, tileY: 0, b1: 5, b2: 3},
				{tileX: 1, tileY: 0, b1: 3, b2: 5},
				{tileX: 0, tileY: -1, b1: 7, b2: 1}
			],
			fromGroup
		);
		checkSurrounding(
			map, layer, tileX, tileY + height - 1,
			[
				{tileX: -1, tileY: 0, b1: 5, b2: 3},
				{tileX: 1, tileY: 0, b1: 3, b2: 5},
				{tileX: 0, tileY: 1, b1: 1, b2: 7}
			],
			fromGroup
		);

		for (var i = 0; i < height; i++) {
			tile = map.getTile(tileX, tileY + i)[layer];
			neighbour = map.getTile(tileX - 1, tileY + i)[layer];
			if ((neighbour.group === fromGroup) && ((neighbour.index & 16) === 16)) {
				if ((neighbour.index & 146) !== 146) {
					neighbour.index |= 1 << 3;
					tile.index |= 1 << 5;
				}
			}

			neighbour = map.getTile(tileX + 1, tileY + i)[layer];
			if ((neighbour.group === fromGroup) && ((neighbour.index & 16) === 16)) {
				if ((neighbour.index & 146) !== 146) {
					neighbour.index |= 1 << 5;
					tile.index |= 1 << 3;
				}
			}
		}
	}
};