import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

interface SignaturePadProps {
  width?: number
  height?: number
  backgroundColor?: string
  penColor?: string
  onSignatureChange: (signature: string) => void
  onClear: () => void
  disabled?: boolean
}

export function SignaturePad({
  width = 500,
  height = 200,
  backgroundColor = '#ffffff',
  penColor = '#000000',
  onSignatureChange,
  onClear,
  disabled = false
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas styles
    ctx.strokeStyle = penColor
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }, [width, height, backgroundColor, penColor])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    setIsDrawing(true)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    setLastX(x)
    setLastY(y)

    // Update signature data
    const signatureData = canvas.toDataURL('image/png')
    onSignatureChange(signatureData)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    onClear()
  }

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-crosshair touch-none"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
        >
          <Eraser className="h-4 w-4 mr-2" />
          Clear Signature
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Draw your signature in the box above
        </p>
      </div>
    </div>
  )
}