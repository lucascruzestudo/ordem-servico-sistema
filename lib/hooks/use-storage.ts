"use client"

import { useEffect, useState } from "react"
import { storage } from "../storage"

/**
 * Hook to initialize storage on client side
 */
export function useStorage() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    storage.init()
    setInitialized(true)
  }, [])

  return initialized
}
