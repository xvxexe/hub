import { useRef } from 'react'

export function useDragScroll() {
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 })

  function stopDragging(event) {
    dragState.current.active = false
    event.currentTarget.dataset.dragging = 'false'
  }

  return {
    onPointerDown: (event) => {
      if (event.button !== undefined && event.button !== 0) return

      const element = event.currentTarget
      dragState.current = {
        active: true,
        startX: event.clientX,
        scrollLeft: element.scrollLeft,
      }
      element.setPointerCapture?.(event.pointerId)
      element.dataset.dragging = 'true'
    },
    onPointerMove: (event) => {
      if (!dragState.current.active) return

      const element = event.currentTarget
      element.scrollLeft = dragState.current.scrollLeft - (event.clientX - dragState.current.startX)
    },
    onPointerUp: stopDragging,
    onPointerCancel: stopDragging,
    onMouseLeave: stopDragging,
  }
}
