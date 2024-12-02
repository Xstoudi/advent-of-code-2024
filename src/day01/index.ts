import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Cache from '../utils/decorators/cache'
import Timed, { type TimedResult } from '../utils/decorators/timed'

class Day01 extends Day {
	nth() {
		return '01'
	}

	name() {
		return 'Historian Hysteria'
	}

	get #content() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	async #cleanInput(): Promise<[number[], number[]]> {
		return (await this.#content)
			.split('\n')
			.map((line) => line.trim())
			.map((line) => line.split('   '))
			.map((line) => line.map((elem) => Number.parseInt(elem)))
			.reduce(
				(arrays, current) => {
					current.forEach((value, index) => {
						arrays[index] = [...(arrays[index] ?? []), value]
					})
					return arrays
				},
				[[], []] as [number[], number[]],
			)
	}

	@Timed
	async part1(): Promise<TimedResult> {
		const cleaned = await this.#cleanInput()
		return cleaned
			.map((arrays) => arrays.toSorted((a, b) => a - b))
			.reduce(
				(arrays, current) =>
					arrays.length === 0
						? current
						: arrays.map((value: number, index: number) =>
								Math.abs(value - current[index]),
							),
				[],
			)
			.reduce(
				(value: number, current: number) => value + current,
				0,
			) as unknown as TimedResult
	}

	@Timed
	async part2(): Promise<TimedResult> {
		const [references, toCount] = await this.#cleanInput()
		return references.reduce(
			(previous, current) =>
				previous + current * this.countOccurrences(current, toCount),
			0,
		) as unknown as TimedResult
	}

	@Cache(['search'])
	countOccurrences(search: number, array: number[]) {
		return array.filter((value) => value === search).length
	}
}

const day01 = new Day01()
await day01.run()
