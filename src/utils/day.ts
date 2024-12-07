import { table } from 'table'
import type { TableUserConfig } from 'table/dist/src/types/api'
import type { TimedResult } from './decorators/timed'

export default abstract class Day {
	abstract nth(): string
	abstract name(): string

	abstract part1(input: string): Promise<TimedResult>
	abstract part2(input: string): Promise<TimedResult>

	abstract input(): Promise<string>

	async run() {
		const input = await this.input()
		const data = [
			[`Day ${this.nth()} - ${this.name()}`, '', ''],
			['Part', 'Time', 'Result'],
			...[await this.part1(input), await this.part2(input)].map(
				({ time, result }: TimedResult, index: number) => [
					index + 1,
					time,
					result,
				],
			),
		]

		const columnsWidths = data
			.slice(1)
			.reduce(
				(previousWidths, line) =>
					previousWidths.map((previousWidth: number, index: number) => {
						const a = previousWidth
						const b = `${line[index]}`.length
						return a < b ? b : a
					}),
				new Array(data[0].length).fill(0),
			)
			.map((x: number) => x * 2)

		const config: TableUserConfig = {
			columnDefault: {
				alignment: 'left',
			},
			columns: columnsWidths.map((width: number) => ({ width })),
			spanningCells: [{ col: 0, row: 0, colSpan: 3 }],
		}

		console.log(table(data, config))
	}
}
