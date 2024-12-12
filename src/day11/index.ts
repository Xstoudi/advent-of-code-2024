import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

export default class Day11 extends Day {
	nth() {
		return '11'
	}

	name() {
		return 'Plutonian Pebbles'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		return [
			...[...Array(25)]
				.reduce(
					(acc: Map<number, number>, _) => {
						return this.#blink(acc)
					},
					new Map(input.split(' ').map((x) => [Number.parseInt(x, 10), 1])),
				)
				.values(),
		].reduce((a: number, b: number) => a + b, 0) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		return [
			...[...Array(75)]
				.reduce(
					(acc: Map<number, number>, _) => {
						return this.#blink(acc)
					},
					new Map(input.split(' ').map((x) => [Number.parseInt(x, 10), 1])),
				)
				.values(),
		].reduce((a: number, b: number) => a + b, 0) as unknown as TimedResult
	}

	#blink(stones: Map<number, number>) {
		const generation = new Map<number, number>()
		for (const [id, count] of stones) {
			if (id === 0) {
				generation.set(1, (generation.get(1) ?? 0) + count)
			} else if (`${id}`.length % 2 === 0) {
				const stoneStr = `${id}`
				const mid = Math.floor(stoneStr.length / 2)

				const parts = [
					Number.parseInt(stoneStr.slice(0, mid), 10),
					Number.parseInt(stoneStr.slice(mid), 10),
				]
				generation.set(parts[0], (generation.get(parts[0]) ?? 0) + count)
				generation.set(parts[1], (generation.get(parts[1]) ?? 0) + count)
			} else {
				const multiplied = id * 2024
				generation.set(multiplied, (generation.get(multiplied) ?? 0) + count)
			}
		}
		return generation
	}
}
