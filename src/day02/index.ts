import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

class Day02 extends Day {
	nth() {
		return '02'
	}

	name() {
		return 'Red-Nosed Reports'
	}

	get #content() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	async #cleanInput(): Promise<number[][]> {
		return (await this.#content)
			.split('\n')
			.map((line) => line.trim())
			.map((line) => line.split(' '))
			.map((line) => line.map((elem) => Number.parseInt(elem)))
	}

	@Timed
	async part1(): Promise<TimedResult> {
		const input = await this.#cleanInput()

		return input.filter((x) => this.#isReportSafe(x))
			.length as unknown as TimedResult
	}

	@Timed
	async part2(): Promise<TimedResult> {
		const input = await this.#cleanInput()
		const x = input.filter((line) => {
			if (this.#isReportSafe(line)) {
				return true
			}
			for (let i = 0; i < line.length; i++) {
				if (this.#isReportSafe(line.toSpliced(i, 1))) {
					return true
				}
			}
			return false
		}).length

		return x as unknown as TimedResult
	}

	#isReportSafe(report: number[]) {
		const diffs = report.slice(1).map((elem, index) => elem - report[index])
		const expectedDirection = this.getDirection(
			diffs
				.map((diff) => this.getDirection(diff))
				.reduce((total: number, direction: number) => total + direction, 0),
		)

		for (const diff of diffs) {
			const magnitude = Math.abs(diff)
			if (magnitude < 1 || magnitude > 3) return false

			const direction = this.getDirection(diff)
			if (direction !== expectedDirection) return false
		}

		return true
	}

	getDirection(x: number) {
		if (x > 0) return 1
		if (x < 0) return -1
		return 0
	}
}

const day02 = new Day02()
await day02.run()
