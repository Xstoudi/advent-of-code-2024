import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import Day from '../utils/day'
import Cache from '../utils/decorators/cache'
import Timed, { type TimedResult } from '../utils/decorators/timed'

type Vector = { x: number; y: number }
type Antenna = { frequency: string; position: Vector }

export default class Day08 extends Day {
	nth() {
		return '08'
	}

	name() {
		return 'Resonant Collinearity'
	}

	input() {
		return readFile(join(import.meta.dirname, 'input.txt'), {
			encoding: 'utf-8',
		})
	}

	@Timed
	async part1(input: string): Promise<TimedResult> {
		const height = input.length
		const width = input.split('\n')[0].length

		const antennasByFrequency = input
			.split('\n')
			.flatMap((line, y) =>
				line
					.split('')
					.map((c, x) => ({ frequency: c, position: { x, y } }) as Antenna),
			)
			.filter((antenna) => antenna.frequency !== '.')
			.reduce((map, antenna) => {
				const antennas = map.get(antenna.frequency) ?? []
				antennas.push(antenna)
				map.set(antenna.frequency, antennas)
				return map
			}, new Map<string, Antenna[]>())

		const antinodes = new Set()
		for (const frequencyKey of antennasByFrequency.keys()) {
			const antennas = antennasByFrequency.get(frequencyKey)
			if (antennas === undefined) continue
			for (const antennaA of antennas) {
				for (const antennaB of antennas) {
					if (antennaA === antennaB) continue
					const antinode = this.#antinode(antennaA, antennaB)
					if (this.#isInBound(antinode, width, height)) {
						antinodes.add(`${antinode.x},${antinode.y}`)
					}
				}
			}
		}

		return antinodes.size as unknown as TimedResult
	}

	@Timed
	async part2(input: string): Promise<TimedResult> {
		const height = input.length
		const width = input.split('\n')[0].length

		const antennasByFrequency = input
			.split('\n')
			.flatMap((line, y) =>
				line
					.split('')
					.map((c, x) => ({ frequency: c, position: { x, y } }) as Antenna),
			)
			.filter((antenna) => antenna.frequency !== '.')
			.reduce((map, antenna) => {
				const antennas = map.get(antenna.frequency) ?? []
				antennas.push(antenna)
				map.set(antenna.frequency, antennas)
				return map
			}, new Map<string, Antenna[]>())

		const antinodes = new Set()
		for (const frequencyKey of antennasByFrequency.keys()) {
			const antennas = antennasByFrequency.get(frequencyKey)
			if (antennas === undefined) continue
			for (const antennaA of antennas) {
				for (const antennaB of antennas) {
					if (antennaA === antennaB) continue
					antinodes.add(`${antennaA.position.x},${antennaA.position.y}`)
					antinodes.add(`${antennaB.position.x},${antennaB.position.y}`)
					for (let i = 1; ; i++) {
						const antinode = this.#antinode(antennaA, antennaB, i)
						if (this.#isInBound(antinode, width, height)) {
							antinodes.add(`${antinode.x},${antinode.y}`)
						} else {
							break
						}
					}
				}
			}
		}
		return antinodes.size as unknown as TimedResult
	}

	#isInBound(position: Vector, width: number, height: number) {
		const { x, y } = position
		return !(x < 0 || y < 0 || x >= width || y >= width)
	}

	#antinode(of: Antenna, through: Antenna, nth = 1) {
		return this.#add(
			of.position,
			this.#times(this.#diff(of.position, through.position), 1 + nth),
		)
	}

	#add(a: Vector, b: Vector) {
		return { x: a.x + b.x, y: a.y + b.y }
	}

	#times({ x, y }: Vector, time: number) {
		return { x: x * time, y: y * time }
	}

	#diff(a: Vector, b: Vector) {
		return { x: b.x - a.x, y: b.y - a.y }
	}
}
