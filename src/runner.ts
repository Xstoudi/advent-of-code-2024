const days = [
	() => import('./day01'),
	() => import('./day02'),
	() => import('./day03'),
	() => import('./day04'),
	() => import('./day05'),
	() => import('./day06'),
]

const dayIdentifier = Number.parseInt(process.argv.at(2) ?? '', 10)

if (Number.isNaN(dayIdentifier)) {
	for (const day of days) {
		await day()
	}
} else {
	await days[dayIdentifier - 1]()
}
