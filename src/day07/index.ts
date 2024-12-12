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

export default class Day07 extends Day {
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
		return this.#parse(input).reduce(
			(acc, equation) =>
				this.generateOperatorCombinations(
					equation.equationMembers.length - 1,
					Operators1,
				).find(
					(operatorCombination) =>
						operatorCombination.reduce(
							(currentTotal, operator, index) => {
								const nextMember = equation.equationMembers[index + 1]
								switch (operator) {
									case Operators1.PLUS:
										return currentTotal + nextMember
									case Operators1.TIMES:
										return currentTotal * nextMember
									default:
										throw new Error(
											`Unknown operator ${JSON.stringify(operator)}`,
										)
								}
							},
							equation.equationMembers[0], // Start with the first member
						) === equation.controlValue,
				)
					? acc + equation.controlValue
					: acc,
			0,
		) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		return this.#parse(input).reduce(
			(acc, equation) =>
				this.generateOperatorCombinations(
					equation.equationMembers.length - 1,
					Operators2,
				).find(
					(operatorCombination) =>
						operatorCombination.reduce((currentTotal, operator, index) => {
							const member = equation.equationMembers[index + 1]
							switch (operator) {
								case Operators2.PLUS:
									return currentTotal + member
								case Operators2.TIMES:
									return currentTotal * member
								case Operators2.CONCAT:
									return (
										currentTotal * 10 ** Math.ceil(Math.log10(member + 1)) +
										member
									)
								default:
									throw new Error('Unknown operator')
							}
						}, equation.equationMembers[0]) === equation.controlValue,
				)
					? acc + equation.controlValue
					: acc,
			0,
		) as unknown as TimedResult
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

	@Cache(['operatorsCount', 'ops'])
	generateOperatorCombinations(
		operatorsCount: number,
		ops: typeof Operators1 | typeof Operators2,
	): OperatorKey[][] {
		return operatorsCount <= 0
			? [[]]
			: this.generateOperatorCombinations(operatorsCount - 1, ops).flatMap(
					(combination) => [
						...Object.keys(ops).map((op) => [
							op as OperatorKey,
							...combination,
						]),
					],
				)
	}
}
