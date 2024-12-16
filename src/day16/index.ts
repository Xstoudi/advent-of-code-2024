import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Vector = { x: number; y: number }

type Tile = {
	type: 'PATH' | 'WALL' | 'START' | 'END'
	position: Vector
}
type Direction = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST'
type State = {
	position: Vector
	direction: Direction
	cost: number
	parent: Omit<State, 'parent'> | null
}

const DIRECTIONS: Record<Direction, { dx: number; dy: number }> = {
	NORTH: { dx: 0, dy: -1 },
	SOUTH: { dx: 0, dy: 1 },
	WEST: { dx: -1, dy: 0 },
	EAST: { dx: 1, dy: 0 },
}

export default class Day16 extends Day {
	nth() {
		return '16'
	}

	name() {
		return 'Reindeer Maze'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	#maze: Tile[][] = []

	@Timed
	async part1(input: string): Promise<TimedResult> {
		this.#maze = input.split('\n').map((line, y) =>
			line.split('').map(
				(char, x) =>
					({
						type: this.#mapToType(char),
						position: { x, y },
					}) as Tile,
			),
		)

		const startPosition = this.#maze
			.flat()
			.find((tile) => tile.type === 'START')?.position
		if (startPosition === undefined) {
			throw new Error('Missing start position')
		}

		const endPosition = this.#maze
			.flat()
			.find((tile) => tile.type === 'END')?.position
		if (endPosition === undefined) {
			throw new Error('Missing end position')
		}

		const path = this.#aStar(startPosition, endPosition)
		if (path === null) {
			throw new Error('Path not found...')
		}
		return this.#computeCost(path) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		return 0 as unknown as TimedResult
	}

	#aStar(start: Vector, end: Vector) {
		const openList: State[] = []
		const visited = new Set<string>()
		const uniqueVisited = new Set<string>()

		openList.push({
			position: {
				x: start.x,
				y: start.y,
			},
			direction: 'EAST',
			cost: 0,
			parent: null,
		})

		while (openList.length > 0) {
			openList.sort((a, b) => a.cost - b.cost)

			const current = openList.shift()
			if (current === undefined) {
				throw new Error('Missing current')
			}
			if (current.position.x === end.x && current.position.y === end.y) {
				return this.#reconstructPath(current)
			}

			const stateKey = this.#encodeState(current.position, current.direction)
			if (visited.has(stateKey)) {
				continue
			}

			visited.add(stateKey)

			for (const [newDirection, { dx, dy }] of Object.entries(DIRECTIONS) as [
				Direction,
				{ dx: number; dy: number },
			][]) {
				const nextPosition = {
					x: current.position.x + dx,
					y: current.position.y + dy,
				}

				if (!this.#isValid(nextPosition)) {
					continue
				}

				const cost =
					current.cost + 1 + (current.direction === newDirection ? 0 : 1000)

				openList.push({
					position: nextPosition,
					direction: newDirection,
					cost,
					parent: current,
				})
			}
		}

		return null
	}

	#mapToType(type: string) {
		if (type === '.') return 'PATH'
		if (type === '#') return 'WALL'
		if (type === 'S') return 'START'
		if (type === 'E') return 'END'
	}

	#encodeState(position: Vector, direction: Direction) {
		return `${position.x},${position.y},${direction}`
	}

	#reconstructPath(node: State) {
		const path: State[] = []
		let current: State | null = node

		while (current) {
			path.push({ ...current, parent: null })
			current = <State>current.parent
		}

		return path.reverse()
	}

	#isValid({ x, y }: Vector) {
		return (
			x >= 0 &&
			y >= 0 &&
			x < this.#maze[0].length &&
			y < this.#maze.length &&
			this.#maze[y][x].type !== 'WALL'
		)
	}

	#computeCost(tiles: State[]) {
		return tiles[tiles.length - 1].cost
	}
}
