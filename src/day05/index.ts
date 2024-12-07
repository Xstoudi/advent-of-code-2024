import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

class Day05 extends Day {
	nth() {
		return '05'
	}

	name() {
		return 'Print Queue'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const [beforeAfterInstructions, updates] = this.#input(input)
		const comeAfterRules = this.#buildComeAfterRules(beforeAfterInstructions)

		return updates.reduce(
			(acc, update) =>
				acc +
				(this.#isUpdateValide(update, comeAfterRules)
					? (update.at(update.length / 2) ?? 0)
					: 0),
			0,
		) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const [beforeAfterInstructions, updates] = this.#input(input)
		const comeAfterRules = this.#buildComeAfterRules(beforeAfterInstructions)

		return updates.reduce(
			(acc, update) =>
				acc +
				(this.#isUpdateValide(update, comeAfterRules)
					? 0
					: (update
							.toSorted(this.#updateComparator(comeAfterRules))
							.at(update.length / 2) ?? 0)),
			0,
		) as unknown as TimedResult
	}

	#input(input: string) {
		const [pagesOrdering, pagesUpdate] = input.split('\n\n')
		const beforeAfterInstructions = pagesOrdering
			.split('\n')
			.map((line) => line.split('|').map((x) => Number.parseInt(x, 10)))
		const updates = pagesUpdate
			.split('\n')
			.map((line) => line.split(',').map((x) => Number.parseInt(x, 10)))

		return [beforeAfterInstructions, updates]
	}

	#isUpdateValide(
		updates: number[],
		comeAfterRules: { [key: number]: Set<number> },
	) {
		return !updates.some((update, i) => {
			const comeAfter = comeAfterRules[update]
			if (comeAfter === undefined) return false
			return updates.slice(i + 1).some((nextPage) => comeAfter.has(nextPage))
		})
	}

	#updateComparator(comeAfter: { [key: number]: Set<number> }) {
		return (a: number, b: number) =>
			comeAfter[a]?.has(b) ? 1 : comeAfter[b]?.has(a) ? -1 : 0
	}

	#buildComeAfterRules(beforeAfterInstructions: number[][]) {
		const comeAfterRules: { [key: number]: Set<number> } = {}
		for (const [before, after] of beforeAfterInstructions) {
			comeAfterRules[after] = (comeAfterRules[after] ?? new Set()).add(before)
		}
		return comeAfterRules
	}
}

const day05 = new Day05()
await day05.run()
