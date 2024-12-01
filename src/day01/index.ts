import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import type { TimedResult } from '../utils/decorators/cache'
import Cache from '../utils/decorators/cache'
import Timed from '../utils/decorators/timed'

class Day01 extends Day {
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
	async part1(): Promise<TimedResult<number>> {
		return (await this.#cleanInput())
			.map((arrays) => arrays.toSorted((a, b) => a - b))
			.reduce((arrays, current) => {
				if (arrays === null) return current

				return arrays.map((value, index) => Math.abs(value - current[index]))
			}, null)
			.reduce(
				(value, current) => value + current,
				0,
			) as unknown as TimedResult<number>
	}

	@Timed
	async part2(): Promise<TimedResult<number>> {
		const [references, toCount] = await this.#cleanInput()
		return references.reduce(
			(previous, current) =>
				previous + current * this.countOccurences(current, toCount),
			0,
		) as unknown as TimedResult<number>
	}

	@Cache
	countOccurences(search: number, array: number[]) {
		return array.filter((value) => value === search).length
	}
}

const day01 = new Day01()
await day01.run()
