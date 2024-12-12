import { table } from 'table'
import type { TableUserConfig } from 'table/dist/src/types/api'

const days = [
	() => import('./day01'),
	() => import('./day02'),
	() => import('./day03'),
	() => import('./day04'),
	() => import('./day05'),
	() => import('./day06'),
	() => import('./day07'),
	() => import('./day08'),
	() => import('./day09'),
	() => import('./day10'),
	() => import('./day11'),
	() => import('./day12'),
]

const dayIdentifier = Number.parseInt(process.argv.at(2) ?? '', 10)

const data = (
	await Promise.all(
		(
			await Promise.all(
				days
					.filter((day, i) =>
						Number.isNaN(dayIdentifier) ? true : i + 1 === dayIdentifier,
					)
					.map((day) => day()),
			)
		)
			.map((day) => day.default)
			.map((DayX) => new DayX())
			.flatMap(async (dayInstance) =>
				(
					await dayInstance.run()
				).map((result, index) => [
					index % 2 === 0 ? dayInstance.nth() : '',
					index % 2 === 0 ? dayInstance.name() : '',
					`${index + 1}`,
					result.time,
					result.result,
				]),
			),
	)
).flat()

const config: TableUserConfig = {
	columnDefault: {
		alignment: 'left',
	},
	columns: [3, 25, 4, 6, 15].map((width: number) => ({ width })),
	spanningCells: [
		{ row: 0, col: 0, colSpan: 5 },
		...data
			.flatMap((item, index) => [
				index % 2 === 0
					? {
							row: index + 2,
							col: 0,
							rowSpan: 2,
						}
					: null,
				index % 2 === 0
					? {
							row: index + 2,
							col: 1,
							rowSpan: 2,
						}
					: null,
			])
			.filter((x) => x !== null),
	],
}

console.log(
	table(
		[
			['🎄 Advent of Code 2024 🎄', '', '', '', ''],
			['Day', 'Name', 'Part', 'Time', 'Result'],
			...data,
		],
		config,
	),
)
