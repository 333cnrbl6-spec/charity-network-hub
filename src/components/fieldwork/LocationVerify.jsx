import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Check } from 'lucide-react';

export default function LocationVerify({ onLocationVerified }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy_meters: Math.round(position.coords.accuracy),
          };
          setLocation(coords);
          onLocationVerified(coords);
        },
        (err) => setError(err.message)
      );
    }
  }, [onLocationVerified]);

  if (!location && !error) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6 text-sm text-amber-900">
          Location not available: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          Location Verified
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
        </div>
        <p className="text-green-700">Accuracy: ±{location.accuracy_meters}m</p>
      </CardContent>
    </Card>
  );
}