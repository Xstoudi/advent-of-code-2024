import { table } from 'table'
import type { TableUserConfig } from 'table/dist/src/types/api'
import type { TimedResult } from './decorators/timed'

export default abstract class Day {
	abstract part1(): Promise<TimedResult>
	abstract part2(): Promise<TimedResult>

	async run() {
		const data = [
			['Day 01 - Historian Hysteria', '', ''],
			['Part', 'Time', 'Result'],
			...(await Promise.all([this.part1(), this.part2()])).map(
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
