import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function SignatureCapture({ onSignatureCapture }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasSigned, setHasSigned] = React.useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSignatureCapture(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    onSignatureCapture(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-lg bg-white p-4">
        <p className="text-sm text-muted-foreground mb-2">Sign with your mouse or touchpad</p>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="border-2 border-dashed border-muted rounded bg-white cursor-crosshair w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSigned}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={saveSignature}
          disabled={!hasSigned}
          className="flex-1"
        >
          Confirm Signature
        </Button>
      </div>
    </div>
  );
}