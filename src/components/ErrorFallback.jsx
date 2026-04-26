import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ErrorFallback({ error, reset }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Something went wrong</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                onClick={reset}
                className="mt-4 w-full"
                variant="outline"
              >
                Try again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}