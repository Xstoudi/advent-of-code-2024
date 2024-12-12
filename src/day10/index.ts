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

interface Vector {
	x: number
	y: number
}

export default class Day10 extends Day {
	nth() {
		return '10'
	}

	name() {
		return 'Hoof It'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const matrix = this.#asMatrix(input)

		const zeroes = this.#findAll(0, matrix)
		const nines = this.#findAll(9, matrix)

		const scores = new Map<string, number>(
			zeroes.map((position) => [this.#key(position), 0]),
		)
		for (const nine of nines) {
			const explored = this.#bfs(nine, matrix)
			for (const zero of zeroes) {
				const key = this.#key(zero)
				if (explored.has(key)) {
					scores.set(key, (scores.get(key) ?? 0) + 1)
				}
			}
		}
		return [...scores.values()].reduce(
			(acc, current) => acc + current,
		) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const matrix = this.#asMatrix(input)

		const zeroes = this.#findAll(0, matrix)
		const nines = this.#findAll(9, matrix)

		const scores = new Map<string, number>()
		for (const nine of nines) {
			const explored = this.#bfs(nine, matrix)
			for (const zero of zeroes) {
				const key = this.#key(zero)
				if (explored.has(key)) {
					scores.set(key, (scores.get(key) ?? 0) + (explored.get(key) ?? 0))
				}
			}
		}
		return [...scores.values()].reduce(
			(acc, current) => acc + current,
		) as unknown as TimedResult
	}

	#findAll(value: number, matrix: number[][]): Vector[] {
		const all = []
		for (let y = 0; y < matrix.length; y++) {
			for (let x = 0; x < matrix[0].length; x++) {
				if (matrix[y][x] === value) {
					all.push({ x, y })
				}
			}
		}
		return all
	}

	#asMatrix(input: string) {
		return input
			.split('\n')
			.map((line) => line.split('').map((x) => Number.parseInt(x, 10)))
	}

	#bfs(position: Vector, matrix: number[][]) {
		const explored = new Map<string, number>()
		const queue = new Queue<Vector>()
		explored.set(this.#key(position), 1)
		queue.enqueue(position)

		while (queue.size() > 0) {
			const currentPosition = queue.dequeue()
			const current = matrix[currentPosition.y][currentPosition.x]

			for (const adj of this.#adjacents(
				currentPosition,
				matrix[0].length,
				matrix.length,
			)) {
				if (matrix[adj.y][adj.x] !== current - 1) {
					continue
				}
				queue.enqueue(adj)
				explored.set(this.#key(adj), (explored.get(this.#key(adj)) ?? 0) + 1)
			}
		}
		return explored
	}

	#key({ x, y }: Vector) {
		return `${x},${y}`
	}

	#adjacents({ x, y }: Vector, width: number, height: number) {
		return [
			{ x, y: y - 1 },
			{ x: x + 1, y },
			{ x, y: y + 1 },
			{ x: x - 1, y },
		].filter((x) => this.#isInBound(x, width, height))
	}

	#isInBound(position: Vector, width: number, height: number) {
		return (
			position.x >= 0 &&
			position.x < width &&
			position.y >= 0 &&
			position.y < height
		)
	}
}
