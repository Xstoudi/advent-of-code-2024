import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

enum TypeEnum {
	EMPTY = 0,
	BLOCK = 1,
	START = 2,
}

enum DirectionEnum {
	NORTH = 0,
	EAST = 1,
	SOUTH = 2,
	WEST = 3,
}

type Vector = { x: number; y: number }

type StartSquare = {
	position: Vector
	type: TypeEnum.START
	direction: DirectionEnum
}

type Square =
	| StartSquare
	| {
			position: Vector
			type: TypeEnum.EMPTY
	  }
	| {
			position: Vector
			type: TypeEnum.BLOCK
	  }

export default class Day06 extends Day {
	nth() {
		return '06'
	}

	name() {
		return 'Guard Gallivant'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const matrix = this.#asMatrix(input)
		const startSquare = this.#extractStart(matrix)

		let currentDirection = startSquare.direction
		let cursorPosition = startSquare.position
		const visited: Set<string> = new Set()
		for (;;) {
			visited.add(`${cursorPosition.x},${cursorPosition.y}`)

			const nextPosition = this.#nextPosition(cursorPosition, currentDirection)
			const nextSquare = matrix[nextPosition.y]?.[nextPosition.x] ?? null

			if (nextSquare === null) {
				break
			}

			if (nextSquare.type === TypeEnum.BLOCK) {
				currentDirection = this.#turnRight(currentDirection)
			} else {
				cursorPosition = nextSquare.position
			}
		}
		return visited.size as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const matrix = this.#asMatrix(input)
		const startSquare = this.#extractStart(matrix)

		let currentDirection = startSquare.direction
		let cursorPosition = startSquare.position

		const toCheckForObstruction = new Set<string>()
		for (;;) {
			const nextPosition = this.#nextPosition(cursorPosition, currentDirection)
			toCheckForObstruction.add(`${cursorPosition.x},${cursorPosition.y}`)

			const nextSquare = matrix[nextPosition.y]?.[nextPosition.x] ?? null
			if (nextSquare === null) {
				break
			}
			if (nextSquare.type === TypeEnum.BLOCK) {
				currentDirection = this.#turnRight(currentDirection)
			} else {
				cursorPosition = nextSquare.position
			}
		}

		let loops = 0
		for (const obstructionDescription of toCheckForObstruction) {
			const [xObstacle, yObstacle] = obstructionDescription
				.split(',')
				.map((x) => Number(x))
			matrix[yObstacle][xObstacle].type = TypeEnum.BLOCK
			const visited: Set<string> = new Set()
			for (;;) {
				visited.add(
					`${cursorPosition.x},${cursorPosition.y}.${currentDirection}`,
				)
				const nextPosition = this.#nextPosition(
					cursorPosition,
					currentDirection,
				)
				const nextSquare = matrix[nextPosition.y]?.[nextPosition.x] ?? null
				if (nextSquare === null) {
					break
				}
				if (
					visited.has(
						`${nextSquare.position.x},${nextSquare.position.y}.${currentDirection}`,
					)
				) {
					loops++
					break
				}

				if (nextSquare.type === TypeEnum.BLOCK) {
					currentDirection = this.#turnRight(currentDirection)
				} else {
					cursorPosition = nextSquare.position
				}
			}
			currentDirection = startSquare.direction
			cursorPosition = { ...startSquare.position }
			matrix[yObstacle][xObstacle].type = TypeEnum.EMPTY
		}
		return loops as unknown as TimedResult
	}

	#turnRight(direction: DirectionEnum) {
		switch (direction) {
			case DirectionEnum.NORTH:
				return DirectionEnum.EAST
			case DirectionEnum.EAST:
				return DirectionEnum.SOUTH
			case DirectionEnum.SOUTH:
				return DirectionEnum.WEST
			case DirectionEnum.WEST:
				return DirectionEnum.NORTH
			default:
				throw new Error('Invalid DirectionEnum')
		}
	}

	#extractStart(matrix: Square[][]): StartSquare {
		const start = matrix.flat().find((elem) => elem.type === TypeEnum.START)
		if (start === undefined) throw new Error('Start not found')
		return { ...start }
	}

	#nextPosition({ x, y }: Vector, direction: DirectionEnum) {
		const { x: dx, y: dy } = this.#directionToDelta(direction)
		return { x: x + dx, y: y + dy }
	}

	#directionToDelta(direction: DirectionEnum) {
		switch (direction) {
			case DirectionEnum.NORTH:
				return { x: 0, y: -1 }
			case DirectionEnum.EAST:
				return { x: 1, y: 0 }
			case DirectionEnum.SOUTH:
				return { x: 0, y: 1 }
			case DirectionEnum.WEST:
				return { x: -1, y: 0 }
			default:
				throw new Error('Unknown DirectionEnum')
		}
	}

	#asMatrix(input: string): Square[][] {
		return input.split('\n').map((line, y) =>
			line.split('').map((character, x) => {
				switch (character) {
					case '.':
						return {
							type: TypeEnum.EMPTY,
							position: { x, y },
						}
					case '#':
						return {
							type: TypeEnum.BLOCK,
							position: { x, y },
						}
					case '^':
						return {
							type: TypeEnum.START,
							direction: DirectionEnum.NORTH,
							position: { x, y },
						}
					case '>':
						return {
							type: TypeEnum.START,
							direction: DirectionEnum.EAST,
							position: { x, y },
						}
					case 'v':
						return {
							type: TypeEnum.START,
							direction: DirectionEnum.SOUTH,
							position: { x, y },
						}
					case '<':
						return {
							type: TypeEnum.START,
							direction: DirectionEnum.WEST,
							position: { x, y },
						}
					default:
						throw new Error(`Invalid char: ${character}`)
				}
			}),
		)
	}
}
