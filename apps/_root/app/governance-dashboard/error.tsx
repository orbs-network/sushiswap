'use client'

import React, { useEffect } from 'react'
import { Button } from '@sushiswap/ui/future/components/button/Button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <Button color="default" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
