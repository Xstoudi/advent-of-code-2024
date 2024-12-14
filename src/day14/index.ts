import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { deflate } from 'pako'

import Day from '../utils/day'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Vector = {
	x: number
	y: number
}

type Robot = {
	position: Vector
	velocity: Vector
}

export default class Day14 extends Day {
	nth() {
		return '14'
	}

	name() {
		return 'Restroom Redoubt'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	#width = 101
	#height = 103
	#origin = { x: this.#width / 2, y: this.#height / 2 }

	@Timed
	async part1(input: string): Promise<TimedResult> {
		let robots = this.#parseRobots(input)
		for (let i = 0; i < 100; i++) {
			robots = this.#tick(robots)
		}

		// this.#print(robots)
		const firstQuadrant = robots.filter(
			({ position }) =>
				position.x < Math.floor(this.#width / 2) &&
				position.y < Math.floor(this.#height / 2),
		).length
		const secondQuadrant = robots.filter(
			({ position }) =>
				position.x >= Math.ceil(this.#width / 2) &&
				position.y < Math.floor(this.#height / 2),
		).length
		const thirdQuadrant = robots.filter(
			({ position }) =>
				position.x < Math.floor(this.#width / 2) &&
				position.y >= Math.ceil(this.#height / 2),
		).length
		const fourthQuadrant = robots.filter(
			({ position }) =>
				position.x >= Math.ceil(this.#width / 2) &&
				position.y >= Math.ceil(this.#height / 2),
		).length

		return (firstQuadrant *
			secondQuadrant *
			thirdQuadrant *
			fourthQuadrant) as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		let robots = this.#parseRobots(input)

		let min = [-1, Number.MAX_SAFE_INTEGER]
		for (let i = 0; i < this.#width * this.#height; i++) {
			robots = this.#tick(robots)
			const average = this.#averageDistanceToOrigin(robots)
			if (average < min[1]) {
				min = [i, average]
			}
		}
		return (min[0] + 1) as unknown as TimedResult
	}

	#parseRobots(input: string) {
		return input.split('\n').map((line) => {
			const [position, velocity] = line.split(' ').map((linePart) =>
				linePart
					.slice(2)
					.split(',')
					.map((x) => Number.parseInt(x, 10)),
			)
			return {
				position: { x: position[0], y: position[1] },
				velocity: { x: velocity[0], y: velocity[1] },
			} as Robot
		})
	}

	#tick(robots: Robot[]) {
		return this.#teleportInbound(
			robots.map((robot) => ({
				...robot,
				position: {
					x: robot.position.x + robot.velocity.x,
					y: robot.position.y + robot.velocity.y,
				},
			})),
		)
	}

	#teleportInbound(robots: Robot[]) {
		return robots.map((robot) => ({
			...robot,
			position: {
				x:
					robot.position.x < 0
						? this.#width + robot.position.x
						: robot.position.x >= this.#width
							? robot.position.x - this.#width
							: robot.position.x,
				y:
					robot.position.y < 0
						? this.#height + robot.position.y
						: robot.position.y >= this.#height
							? robot.position.y - this.#height
							: robot.position.y,
			},
		}))
	}

	#asText(robots: Robot[]) {
		let toPrint = ''
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				const robotAtPlace = robots.filter(
					(robot) => robot.position.x === x && robot.position.y === y,
				)
				toPrint += robotAtPlace.length || '.'
			}
			toPrint += '\n'
		}
		return toPrint
	}

	#averageDistanceToOrigin(robots: Robot[]) {
		return robots
			.map(
				(robot) =>
					(robot.position.x - this.#origin.x) ** 2 +
					(robot.position.y - this.#origin.y) ** 2,
			)
			.reduce((acc, current) => acc + current, 0)
	}

	#print(robots: Robot[]) {
		console.log(this.#asText(robots))
	}
}
