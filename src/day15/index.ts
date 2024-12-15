import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Vector = {
	x: number
	y: number
}

const TileType = {
	ROBOT: '@',
	BOX: 'O',
	WALL: '#',
	EMPTY: '.',
} as const
type TileTypeKeys = (typeof TileType)[keyof typeof TileType]

const Direction = {
	UP: '^',
	RIGHT: '>',
	DOWN: 'v',
	LEFT: '<',
} as const
type DirectionKeys = (typeof Direction)[keyof typeof Direction]

type Tile = { type: TileTypeKeys; position: Vector }

export default class Day15 extends Day {
	nth() {
		return '15'
	}

	name() {
		return 'Warehouse Woes'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	#width = 0
	#height = 0

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const [boardRaw, movementSequenceRaw] = input.split('\n\n')

		this.#height = boardRaw.split('\n').length
		this.#width = boardRaw.split('\n').map((line) => line.split(''))[0].length

		const board = boardRaw.split('\n').flatMap((line, y) =>
			line.split('').map((c: string, x: number) => ({
				type: c as TileTypeKeys,
				position: { x, y },
			})),
		)
		const movements = movementSequenceRaw
			.split('\n')
			.flatMap((line) => line.split('')) as DirectionKeys[]

		for (const movement of movements) {
			this.#move(board, movement)
		}

		return board
			.filter((tile) => tile.type === TileType.BOX)
			.reduce(
				(acc, tile) => acc + tile.position.x + tile.position.y * 100,
				0,
			) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		return 0 as unknown as TimedResult
	}

	#move(board: Tile[], direction: DirectionKeys) {
		const robot = this.#find(board, (tile) => tile.type === TileType.ROBOT)
		this.#push(board, robot, direction)
	}

	#push(board: Tile[], tileToPush: Tile, direction: DirectionKeys): boolean {
		const nextTile = this.#find(board, (tile) => {
			if (direction === Direction.UP) {
				return (
					tile.position.x === tileToPush.position.x &&
					tile.position.y === tileToPush.position.y - 1
				)
			}
			if (direction === Direction.RIGHT) {
				return (
					tile.position.x === tileToPush.position.x + 1 &&
					tile.position.y === tileToPush.position.y
				)
			}
			if (direction === Direction.DOWN) {
				return (
					tile.position.x === tileToPush.position.x &&
					tile.position.y === tileToPush.position.y + 1
				)
			}
			if (direction === Direction.LEFT) {
				return (
					tile.position.x === tileToPush.position.x - 1 &&
					tile.position.y === tileToPush.position.y
				)
			}
			return false
		})
		if (nextTile.type === TileType.WALL) {
			return false
		}
		if (nextTile.type === TileType.EMPTY) {
			nextTile.type = tileToPush.type
			tileToPush.type = TileType.EMPTY
			return true
		}
		if (nextTile.type === TileType.BOX) {
			const boxHasMoved = this.#push(board, nextTile, direction)
			if (boxHasMoved) {
				nextTile.type = tileToPush.type
				tileToPush.type = TileType.EMPTY
			}
			return boxHasMoved
		}

		return false
	}

	#find(board: Tile[], predicate: (tile: Tile) => boolean) {
		const found = board.find(predicate)
		if (found === undefined) {
			throw new Error('Not found')
		}
		return found
	}

	#print(board: Tile[]) {
		let toPrint = ''
		for (let i = 0; i < this.#height; i++) {
			for (let j = 0; j < this.#width; j++) {
				const tile = board.find(
					(tile) => tile.position.x === j && tile.position.y === i,
				)
				if (tile === undefined) {
					throw new Error('Missing tile')
				}
				toPrint += tile.type
			}
			toPrint += '\n'
		}
		console.log(toPrint)
	}
}
