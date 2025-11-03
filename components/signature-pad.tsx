"use client"

import React, { useRef, useEffect, useState } from "react"

type SignaturePadProps = {
  initialData?: string | null
  onSave: (dataUrl: string) => void
  onCancel: () => void
  title?: string
}

export default function SignaturePad({ initialData, onSave, onCancel, title }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.width = 800
    canvas.height = 240
    canvas.style.width = "100%"
    canvas.style.height = "150px"
    const ctx = canvas.getContext("2d")!
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = 2.5
    ctx.strokeStyle = "#000"
    ctxRef.current = ctx

    // If initialData is provided, draw it
    if (initialData) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setIsEmpty(false)
      }
      img.src = initialData
    }
  }, [initialData])

  const getPointer = (e: PointerEvent | PointerEventInit | any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const ratioX = canvas.width / rect.width
    const ratioY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * ratioX
    const y = (e.clientY - rect.top) * ratioY
    return { x, y }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    drawing.current = true
    const { x, y } = getPointer(e)
    const ctx = ctxRef.current!
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const { x, y } = getPointer(e)
    const ctx = ctxRef.current!
    ctx.lineTo(x, y)
    ctx.stroke()
    setIsEmpty(false)
  }

  const handlePointerUp = () => {
    drawing.current = false
  }

  const handleClear = () => {
    const canvas = canvasRef.current!
    const ctx = ctxRef.current!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const handleSave = () => {
    const canvas = canvasRef.current!
    const dataUrl = canvas.toDataURL("image/png")
    onSave(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded shadow-lg max-w-3xl w-full p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title || "Assinatura"}</h3>
          <button className="text-sm text-gray-600" onClick={onCancel} aria-label="Fechar">
            Fechar
          </button>
        </div>
        <div className="border rounded">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-36 touch-none bg-white"
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100"
            >
              Recomeçar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isEmpty}
              className={`px-3 py-1 rounded text-white ${isEmpty ? "bg-gray-300" : "bg-primary"}`}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
