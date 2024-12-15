import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type File1 = { type: 'file'; id: number }
type Free1 = { type: 'free' }
type Sector1 = File1 | Free1

type File2 = { type: 'file'; id: number }
type Free2 = { type: 'free' }
type Sector2 = File2 | Free2

export default class Day09 extends Day {
	nth() {
		return '09'
	}

	name() {
		return 'Disk Fragmenter'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const description = input
			.split('')
			.map((c) => Number.parseInt(c, 10))
			.flatMap((value, index) =>
				Array.from<Sector1>(Array(value).keys() as unknown as Sector1[]).fill(
					index % 2 === 0
						? {
								type: 'file',
								id: index / 2,
							}
						: { type: 'free' },
				),
			)

		let leftCursor = 0
		let rightCursor = description.length - 1
		while (true) {
			while (description[leftCursor].type !== 'free') {
				leftCursor++
			}
			while (description[rightCursor].type !== 'file') {
				rightCursor--
			}

			if (leftCursor >= rightCursor) {
				break
			}

			const left = description[leftCursor] as Free1
			const right = description[rightCursor] as File1
			const free = description[leftCursor]
			description[leftCursor] = description[rightCursor]
			description[rightCursor] = free
		}

		const checksum = description.reduce(
			(acc, current, index) =>
				current.type === 'free' ? acc : acc + current.id * index,
			0,
		)

		return checksum as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const description = input
			.split('')
			.map((c) => Number.parseInt(c, 10))
			.flatMap((value, index) =>
				Array.from<number | '.'>(Array(value).keys()).fill(
					index % 2 === 0 ? index / 2 : '.',
				),
			)

		let rightCursor = description.length - 1
		while (rightCursor > 0) {
			const id = description[rightCursor]
			if (id === '.') {
				rightCursor--
				continue
			}

			const start = rightCursor
			while (description[rightCursor] === id) {
				rightCursor--
			}
			const length = start - rightCursor

			let leftCursor = 0
			while (leftCursor <= rightCursor) {
				let i = 0
				while (i < length) {
					if (description[leftCursor + i] !== '.') break
					i++
				}
				if (i === length) break
				leftCursor += i + 1
			}
			if (leftCursor > rightCursor) continue

			for (let i = 0; i < length; i++) {
				description[leftCursor + i] = id
				description[start - i] = '.'
			}
		}
		const checksum = description.reduce(
			(acc: number, current, index) =>
				current === '.' ? acc : acc + current * index,
			0,
		)

		return checksum as unknown as TimedResult
	}
}
