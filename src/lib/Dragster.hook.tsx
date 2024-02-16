import {useEffect, useRef} from 'react'

interface DragsterOptions {
	dragsterEnter?: (e: React.DragEvent<HTMLDivElement>) => any
	dragsterLeave?: (e: React.DragEvent<HTMLDivElement>) => any
	dragsterDrop?: (e: React.DragEvent<HTMLDivElement>) => any
	dragsterOver?: (e: React.DragEvent<HTMLDivElement>) => any
	accepts: string
}

const useDragster = ({dragsterEnter, dragsterDrop, dragsterLeave, dragsterOver, accepts}: DragsterOptions) => {
	const elementRef = useRef<any>(null)
	let first = false
	let second = false

	const acceptsType = (event: React.DragEvent<HTMLDivElement>): boolean => {
		if (!accepts) return false
		const acceptables = accepts.split(' ')
		for (const acceptable of acceptables) {
			if (event.dataTransfer.types.includes(`application/draggable-for-${acceptable}`)) {
				return true
			}
		}
		return false
	}

	const dragenter = (event: React.DragEvent<HTMLDivElement>) => {
		event.stopPropagation()
		event.preventDefault()

		if (first) {
			second = true
		} else {
			first = true

			const enterEvent = new CustomEvent('dragsterEnter', {
				bubbles: true,
				cancelable: false,
				detail: {
					dataTransfer: event.dataTransfer,
					sourceEvent: event,
				},
			})
			elementRef.current?.dispatchEvent(enterEvent)
			dragsterEnter && dragsterEnter(event)
		}
	}

	const dragleave = (event: React.DragEvent<HTMLDivElement>) => {
		event.stopPropagation()
		event.preventDefault()

		if (second) {
			second = false
		} else if (first) {
			first = false
		}

		if (!first && !second) {
			const leaveEvent = new CustomEvent('dragsterLeave', {
				bubbles: true,
				cancelable: false,
				detail: {
					dataTransfer: event.dataTransfer,
					sourceEvent: event,
				},
			})
			elementRef.current?.dispatchEvent(leaveEvent)
			dragsterLeave && dragsterLeave(event)
		}
	}

	const drop = (event: React.DragEvent<HTMLDivElement>) => {
		event.stopPropagation()
		event.preventDefault()

		first = false
		second = false
		dragsterDrop && dragsterDrop(event)
	}

	const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
		if (acceptsType(event)) {
			event.preventDefault()
			event.stopPropagation()
		}

		dragsterOver && dragsterOver(event)
	}

	useEffect(() => {
		const element = elementRef.current

		if (element) {
			element.addEventListener('dragenter', dragenter)
			element.addEventListener('dragleave', dragleave)
			element.addEventListener('dragover', dragOver)
			element.addEventListener('drop', drop)
		}

		return () => {
			// Cleanup: remove event listeners when the component is unmounted
			if (element) {
				element.removeEventListener('dragenter', dragenter)
				element.removeEventListener('dragleave', dragleave)
				element.removeEventListener('dragover', dragOver)
				element.removeEventListener('drop', drop)
			}
		}
	}, []) // Empty dependency array to run the effect only once on mount

	return {
		elementRef,
	}
}

export default useDragster
