import { table } from 'table'
import type { TableUserConfig } from 'table/dist/src/types/api'
import type { TimedResult } from './utils/decorators/timed'

export default abstract class Day {
	abstract part1(): Promise<TimedResult>
	abstract part2(): Promise<TimedResult>

	async run() {
		const data = [
			['Day 01 - Historian Hysteria', '', ''],
			['Part', 'Time', 'Result'],
			...(await Promise.all([this.part1(), this.part2()])).map(
				({ time, result }, index) => [index + 1, time, result],
			),
		]

		const columnsWidths = data
			.slice(1)
			.reduce(
				(previous, line) =>
					previous.map((previous, index) => {
						const a = previous
						const b = `${line[index]}`.length
						return a < b ? b : a
					}),
				new Array(data[0].length).fill(0),
			)
			.map((x) => x * 2)

		const config: TableUserConfig = {
			columnDefault: {
				alignment: 'left',
			},
			columns: columnsWidths.map((width) => ({ width })),
			spanningCells: [{ col: 0, row: 0, colSpan: 3 }],
		}

		console.log(table(data, config))
	}
}
