import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Cache from '../utils/decorators/cache'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Line = {
	controlValue: number
	equationMembers: number[]
}

const Operators1 = {
	PLUS: 'PLUS',
	TIMES: 'TIMES',
} as const

const Operators2 = {
	PLUS: 'PLUS',
	TIMES: 'TIMES',
	CONCAT: 'CONCAT',
} as const

type OperatorKey = keyof typeof Operators1 | keyof typeof Operators2

class Day07 extends Day {
	nth() {
		return '07'
	}

	name() {
		return 'Bridge Repair'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const equations = this.#parse(input)

		let totalCalibrationResult = 0
		for (const equation of equations) {
			const operatorCombinations = this.generateOperatorCombinations(
				equation.equationMembers.length,
				Operators1,
			)

			for (const operatorCombination of operatorCombinations) {
				let memberIndex = 0
				let total = equation.equationMembers[memberIndex++]
				for (const operator of operatorCombination) {
					if (operator === Operators1.PLUS) {
						total += equation.equationMembers[memberIndex++]
					} else if (operator === Operators1.TIMES) {
						total *= equation.equationMembers[memberIndex++]
					} else {
						throw new Error(`Unknown operator ${JSON.stringify(operator)}`)
					}
				}
				if (total === equation.controlValue) {
					totalCalibrationResult += equation.controlValue
					break
				}
			}
		}
		return totalCalibrationResult as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const equations = this.#parse(input)

		let totalCalibrationResult = 0
		for (const equation of equations) {
			const operatorCombinations = this.generateOperatorCombinations(
				equation.equationMembers.length,
				Operators2,
			)

			for (const operatorCombination of operatorCombinations) {
				let memberIndex = 0
				let total = equation.equationMembers[memberIndex++]
				for (const operator of operatorCombination) {
					const member = equation.equationMembers[memberIndex++]
					if (operator === Operators2.PLUS) {
						total += member
					} else if (operator === Operators2.TIMES) {
						total *= member
					} else if (operator === Operators2.CONCAT) {
						total = total * 10 ** Math.ceil(Math.log10(member + 1)) + member
					} else {
						throw new Error('Unknown operator')
					}
				}
				if (total === equation.controlValue) {
					totalCalibrationResult += equation.controlValue
					break
				}
			}
		}
		return totalCalibrationResult as unknown as TimedResult
	}

	#parse(input: string): Line[] {
		return input
			.split('\n')
			.map((line) => line.split(': '))
			.map(([controlValue, equationMembers]) => ({
				controlValue: Number.parseInt(controlValue, 10),
				equationMembers: equationMembers
					.split(' ')
					.map((x) => Number.parseInt(x, 10)),
			}))
	}

	@Cache(['terms', 'ops'])
	generateOperatorCombinations(
		terms: number,
		ops: typeof Operators1 | typeof Operators2,
	): OperatorKey[][] {
		const operatorsCount = terms - 1
		if (operatorsCount <= 0) {
			return [[]]
		}

		const combinations = this.generateOperatorCombinations(operatorsCount, ops)
		return combinations.flatMap((combination) => [
			...Object.keys(ops).map((op) => [op as OperatorKey, ...combination]),
		])
	}
}

const day07 = new Day07()
await day07.run()
