export default function Cache(
	target: unknown,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) {
	const originalMethod = descriptor.value
	const cache = new Map<string, unknown>()

	descriptor.value = function (...args: unknown[]) {
		const key = JSON.stringify(args)
		if (cache.has(key)) {
			return cache.get(key)
		}
		const result = originalMethod.apply(this, args)
		cache.set(key, result)
		return result
	}

	return descriptor
}

export interface TimedResult<T> {
	time: string
	result: T
}
