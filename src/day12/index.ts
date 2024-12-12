import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

class Queue<T> {
	private storage: T[] = []

	constructor(private capacity: number = Number.POSITIVE_INFINITY) {}

	enqueue(item: T): void {
		if (this.size() === this.capacity) {
			throw Error('Queue has reached max capacity, you cannot add more items')
		}
		this.storage.push(item)
	}
	dequeue(): T {
		const item = this.storage.shift()
		if (item === undefined) {
			throw new Error('Nothing to dequeue.')
		}
		return item
	}
	size(): number {
		return this.storage.length
	}
}

type Vector = { x: number; y: number }

enum DirectionEnum {
	NORTH = 0,
	EAST = 1,
	SOUTH = 2,
	WEST = 3,
}

export default class Day12 extends Day {
	nth() {
		return '12'
	}

	name() {
		return 'Garden Groups'
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
		const matrix = input.split('\n').map((row) => [...row])
		this.#height = matrix.length
		this.#width = matrix[0].length

		const regions = []
		const visited = new Set<string>()
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				const plot = { x, y }
				const plotKey = this.#key(plot)
				if (visited.has(plotKey)) {
					continue
				}
				const visitedPlots = this.#bfs(plot, matrix)
				for (const visitedPlot of visitedPlots) {
					visited.add(visitedPlot)
				}
				regions.push(visitedPlots)
			}
		}

		return regions
			.map(this.#price.bind(this))
			.reduce((acc, current) => acc + current, 0) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const matrix = input.split('\n').map((row) => [...row])
		this.#height = matrix.length
		this.#width = matrix[0].length

		const regions = []
		const visited = new Set<string>()
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				const plot = { x, y }
				const plotKey = this.#key(plot)
				if (visited.has(plotKey)) {
					continue
				}
				const visitedPlots = this.#bfs(plot, matrix)
				for (const visitedPlot of visitedPlots) {
					visited.add(visitedPlot)
				}
				regions.push(visitedPlots)
			}
		}

		return regions
			.map(this.#price2.bind(this))
			.reduce((acc, current) => acc + current, 0) as unknown as TimedResult
	}

	#key({ x, y }: Vector) {
		return `${x},${y}`
	}

	#position(key: string): Vector {
		const parts = key.split(',').map((part) => Number.parseInt(part, 10))
		return { x: parts[0], y: parts[1] }
	}

	#bfs(position: Vector, matrix: string[][]) {
		const width = matrix[0].length
		const height = matrix.length

		const explored = new Set<string>()
		const queue = new Queue<Vector>()

		explored.add(this.#key(position))
		queue.enqueue(position)

		while (queue.size() > 0) {
			const current = queue.dequeue()
			const label = this.#label(current, matrix)
			for (const adjacentPlot of this.#adjacents(current)) {
				const adjacentPlotKey = this.#key(adjacentPlot)
				if (
					this.#label(adjacentPlot, matrix) !== label ||
					explored.has(adjacentPlotKey)
				) {
					continue
				}
				explored.add(adjacentPlotKey)
				queue.enqueue(adjacentPlot)
			}
		}
		return explored
	}

	#label({ x, y }: Vector, matrix: string[][]) {
		return matrix[y][x]
	}

	#adjacents({ x, y }: Vector, bounded = true) {
		return [
			{ x, y: y - 1 },
			{ x: x + 1, y },
			{ x, y: y + 1 },
			{ x: x - 1, y },
		].filter((x) => (bounded ? this.#isInBound(x) : true))
	}

	#isInBound(position: Vector) {
		return (
			position.x >= 0 &&
			position.x < this.#width &&
			position.y >= 0 &&
			position.y < this.#height
		)
	}

	#perimeter(region: Set<string>) {
		return [...region.values()]
			.map((plot) => this.#position(plot))
			.reduce((acc, plot) => {
				return (
					acc +
					this.#adjacents(plot, false).filter(
						(adjacent) => !region.has(this.#key(adjacent)),
					).length
				)
			}, 0)
	}

	#sides(region: Set<string>) {
		const plots = [...region.values()].map(this.#position.bind(this))
		const regionArr = [...region.values()]
		let sides = 0
		for (const { x, y } of plots) {
			const upLeft = this.#key({ x: x - 1, y: y - 1 })
			const up = this.#key({ x, y: y - 1 })
			const upRight = this.#key({ x: x + 1, y: y - 1 })
			const right = this.#key({ x: x + 1, y })
			const downRight = this.#key({ x: x + 1, y: y + 1 })
			const down = this.#key({ x, y: y + 1 })
			const downLeft = this.#key({ x: x - 1, y: y + 1 })
			const left = this.#key({ x: x - 1, y })

			if ([up, upRight, right].every((x) => !regionArr.includes(x))) sides++
			if ([up, upLeft, left].every((x) => !regionArr.includes(x))) sides++
			if ([down, downLeft, left].every((x) => !regionArr.includes(x))) sides++
			if ([down, downRight, right].every((x) => !regionArr.includes(x))) sides++
			if (
				regionArr.includes(up) &&
				regionArr.includes(right) &&
				!regionArr.includes(upRight)
			)
				sides++
			if (
				regionArr.includes(up) &&
				regionArr.includes(left) &&
				!regionArr.includes(upLeft)
			)
				sides++
			if (
				regionArr.includes(down) &&
				regionArr.includes(left) &&
				!regionArr.includes(downLeft)
			)
				sides++
			if (
				regionArr.includes(down) &&
				regionArr.includes(right) &&
				!regionArr.includes(downRight)
			)
				sides++
			if (
				!regionArr.includes(up) &&
				!regionArr.includes(left) &&
				regionArr.includes(upLeft)
			)
				sides++
			if (
				!regionArr.includes(up) &&
				!regionArr.includes(right) &&
				regionArr.includes(upRight)
			)
				sides++
			if (
				!regionArr.includes(down) &&
				!regionArr.includes(left) &&
				regionArr.includes(downLeft)
			)
				sides++
			if (
				!regionArr.includes(down) &&
				!regionArr.includes(right) &&
				regionArr.includes(downRight)
			)
				sides++
		}

		return sides
	}

	#price(region: Set<string>) {
		return region.size * this.#perimeter(region)
	}

	#price2(region: Set<string>) {
		return region.size * this.#sides(region)
	}
}
