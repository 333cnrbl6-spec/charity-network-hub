import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export default function ClientSignOff({ onSignOff, loading }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [satisfaction, setSatisfaction] = useState([3]);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    const signatureUrl = canvas?.toDataURL('image/png');
    onSignOff({
      feedback,
      satisfaction: satisfaction[0],
      signature: signatureUrl,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Client Sign-Off</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Satisfaction Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">How satisfied are you?</label>
            <Badge variant="secondary">{satisfaction[0]}/5</Badge>
          </div>
          <Slider
            value={satisfaction}
            onValueChange={setSatisfaction}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
        </div>

        {/* Feedback */}
        <div>
          <label className="text-sm font-medium mb-1 block">Any comments?</label>
          <Textarea
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-16 text-sm"
          />
        </div>

        {/* Signature */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Signature</label>
          <canvas
            ref={canvasRef}
            width={300}
            height={120}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full border-2 border-dashed border-muted-foreground rounded bg-white cursor-crosshair"
          />
          {hasSignature && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="mt-1 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!hasSignature || loading}
          className="w-full"
        >
          Complete Visit
        </Button>
      </CardContent>
    </Card>
  );
}