import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Letter = 'X' | 'M' | 'A' | 'S'

class Day04 extends Day {
	#letterSequence: Letter[] = ['X', 'M', 'A', 'S']

	nth() {
		return '04'
	}

	name() {
		return 'Ceres Search'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const matrix = this.#asMatrix(input)

		let xmasCount = 0
		for (let x = 0; x < matrix.length; x++) {
			for (let y = 0; y < (matrix.at(0)?.length ?? 0); y++) {
				if (matrix[y][x] !== 'X') continue
				for (const direction of this.#directions) {
					const result = this.#scan(matrix, x, y, direction)
					if (result === 'XMAS') {
						xmasCount += 1
					}
				}
			}
		}

		return xmasCount as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const matrix = this.#asMatrix(input)

		let xmasCount = 0
		for (let x = 0; x < matrix.length; x++) {
			for (let y = 0; y < (matrix.at(0)?.length ?? 0); y++) {
				if (matrix[y][x] !== 'A') continue

				// first diagonal
				const topToBottom = this.#scan(
					matrix,
					x - 1,
					y - 1,
					{ dx: 1, dy: 1 },
					3,
				)
				const bottomToTop = this.#scan(
					matrix,
					x - 1,
					y + 1,
					{ dx: 1, dy: -1 },
					3,
				)
				if (
					['MAS', 'SAM'].includes(topToBottom) &&
					['MAS', 'SAM'].includes(bottomToTop)
				)
					xmasCount++
			}
		}

		return xmasCount as unknown as TimedResult
	}

	#scan(
		matrix: Letter[][],
		x: number,
		y: number,
		{ dx, dy }: { dx: number; dy: number },
		size = 4,
	) {
		const letters = []
		for (
			let [i, j] = [x, y], distance = 0;
			distance < size;
			i += dx, j += dy, distance++
		) {
			const scanned = matrix[j]?.[i] ?? null
			if (scanned === null) {
				break
			}
			letters.push(scanned)
		}
		return letters.join('')
	}

	#nextLetter(letter: Letter) {
		return (
			this.#letterSequence.at(this.#letterSequence.indexOf(letter) + 1) ?? null
		)
	}

	#directions = [
		{ dx: 0, dy: -1 },
		{ dx: 1, dy: -1 },
		{ dx: 1, dy: 0 },
		{ dx: 1, dy: 1 },
		{ dx: 0, dy: 1 },
		{ dx: -1, dy: -1 },
		{ dx: -1, dy: 0 },
		{ dx: -1, dy: 1 },
	]

	#asMatrix(content: string): Letter[][] {
		return content
			.split('\n')
			.map((line) => line.split(''))
			.map((letters) =>
				letters.map((letter) => {
					if (!['X', 'M', 'A', 'S'].includes(letter))
						throw new Error(`${letter} is not a valid letter`)
					return letter as Letter
				}),
			)
	}
}

const day04 = new Day04()
await day04.run()
