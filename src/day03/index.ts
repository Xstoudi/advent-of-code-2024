import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

interface Mul {
	x: number
	y: number
}

interface Do {
	doo: string
}

interface Dont {
	dont: string
}
type XOR<T, U> =
	| (T & Partial<Record<keyof U, never>>)
	| (U & Partial<Record<keyof T, never>>)
type Match = XOR<Mul, XOR<Do, Dont>>

export default class Day03 extends Day {
	nth() {
		return '03'
	}

	name() {
		return 'Mull It Over'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const mulRegex = /mul\((?<x>[1-9][0-9]{0,2}),(?<y>[1-9][0-9]{0,2})\)/gs

		return [...input.matchAll(mulRegex)].reduce((acc, matches) => {
			const { x, y } = (matches.groups as unknown as Mul) ?? { x: 0, y: 0 }
			return acc + x * y
		}, 0) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const mulRegex =
			/(mul\((?<x>[1-9][0-9]{0,2}),(?<y>[1-9][0-9]{0,2})\))|(?<doo>do\(\))|(?<dont>don't\(\))/gs

		return [...input.matchAll(mulRegex)].reduce(
			(acc, matches) => {
				const { x, y, doo, dont } = (matches.groups as unknown as Match) ?? {
					x: undefined,
					y: undefined,
					doo: undefined,
					dont: undefined,
				}

				if (dont !== undefined) {
					acc.enabled = false
				} else if (doo !== undefined) {
					acc.enabled = true
				} else if (x !== undefined && y !== undefined && acc.enabled) {
					acc.sum += x * y
				}
				return acc
			},
			{
				enabled: true,
				sum: 0,
			},
		).sum as unknown as TimedResult
	}
}
