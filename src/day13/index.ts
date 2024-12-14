import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Vector = {
	x: number
	y: number
}

export default class Day13 extends Day {
	nth() {
		return '13'
	}

	name() {
		return 'Claw Contraption'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		return input
			.split('\n\n')
			.map((block) => block.split('\n'))
			.reduce((acc, [btnARaw, btnBRaw, prizeRaw]) => {
				const btnA = this.#parseVector(btnARaw)
				const btnB = this.#parseVector(btnBRaw)
				const prize = this.#parseVector(prizeRaw)

				const { x: a, y: c } = btnA
				const { x: b, y: d } = btnB
				const { x: e, y: f } = prize

				const determinant = a * d - b * c
				if (determinant === 0) {
					return acc
				}

				const btnATimes = (e * d - b * f) / determinant
				const btnBTimes = (a * f - e * c) / determinant

				if (!Number.isInteger(btnATimes) || !Number.isInteger(btnBTimes)) {
					return acc
				}

				return acc + btnATimes * 3 + btnBTimes
			}, 0) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		return input
			.split('\n\n')
			.map((block) => block.split('\n'))
			.reduce((acc, [btnARaw, btnBRaw, prizeRaw]) => {
				const btnA = this.#parseVector(btnARaw)
				const btnB = this.#parseVector(btnBRaw)
				const prize = this.#parseVector(prizeRaw)
				const prizeCorrected = {
					x: prize.x + 10000000000000,
					y: prize.y + 10000000000000,
				}

				const { x: a, y: c } = btnA
				const { x: b, y: d } = btnB
				const { x: e, y: f } = prizeCorrected

				const determinant = a * d - b * c
				if (determinant === 0) {
					return acc
				}

				const btnATimes = (e * d - b * f) / determinant
				const btnBTimes = (a * f - e * c) / determinant

				if (!Number.isInteger(btnATimes) || !Number.isInteger(btnBTimes)) {
					return acc
				}

				return acc + btnATimes * 3 + btnBTimes
			}, 0) as unknown as TimedResult
	}

	#parseVector(input: string) {
		const [, parts] = input.split(': ')
		const [xPart, yPart] = parts.split(', ')
		return {
			x: Number.parseInt(xPart.slice(2), 10),
			y: Number.parseInt(yPart.slice(2), 10),
		}
	}
}
