export default function Cache(includeArgs: string[] | null = null) {
	return (
		target: unknown,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		const originalMethod = descriptor.value
		const cache = new Map<string, unknown>()

		descriptor.value = function (...args: unknown[]) {
			const paramNames = getParameterNames(originalMethod)
			const argsToUse =
				includeArgs === null || includeArgs.length === 0
					? args
					: args.filter((_, index) => includeArgs.includes(paramNames[index]))

			const key = JSON.stringify(argsToUse)
			if (cache.has(key)) {
				return cache.get(key)
			}
			const result = originalMethod.apply(this, args)
			cache.set(key, result)
			return result
		}

		return descriptor
	}
}

function getParameterNames(func: (...args: unknown[]) => unknown): string[] {
	const functionString = func.toString()
	return functionString
		.slice(functionString.indexOf('(') + 1, functionString.indexOf(')'))
		.split(',')
		.map((param) => param.trim().split(' ')[0])
}
