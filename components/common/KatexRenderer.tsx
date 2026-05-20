'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface KatexRendererProps {
  formula: string
  block?: boolean
}

export function KatexRenderer({ formula, block = false }: KatexRendererProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    katex.render(formula, ref.current, {
      throwOnError: false,
      displayMode: block,
    })
  }, [formula, block])

  return <span ref={ref} />
}
