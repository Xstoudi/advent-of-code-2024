import prettyMs from 'pretty-ms'

export interface TimedResult {
	time: string
	result: number
}

export default function Timed(
	target: unknown,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) {
	const originalMethod = descriptor.value

	descriptor.value = async function (...args: unknown[]) {
		const start = performance.now()
		const result = await originalMethod.apply(this, args)
		const end = performance.now()
		return {
			time: prettyMs(end - start, {
				formatSubMilliseconds: true,
				compact: true,
			}),
			result,
		} as unknown as number
	}

	return descriptor
}
