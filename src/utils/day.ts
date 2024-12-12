import type { TimedResult } from './decorators/timed'

export default abstract class Day {
	abstract nth(): string
	abstract name(): string

	abstract part1(input: string): Promise<TimedResult>
	abstract part2(input: string): Promise<TimedResult>

	abstract input(): Promise<string>

	async run(): Promise<[TimedResult, TimedResult]> {
		const input = await this.input()
		return [await this.part1(input), await this.part2(input)]
	}
}
