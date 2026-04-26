import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Users, Briefcase, AlertTriangle, Filter } from 'lucide-react';

// Sample ward boundaries for Manchester (simplified demo coordinates)
const WARD_BOUNDS = {
  'Manchester Central': { lat: 53.4825, lng: -2.2407, zoom: 13, clients: 12, volunteers: 3 },
  'Ancoats & Clayton': { lat: 53.4900, lng: -2.2200, zoom: 13, clients: 28, volunteers: 5 },
  'Ardwick': { lat: 53.4700, lng: -2.2100, zoom: 13, clients: 35, volunteers: 4 },
  'Chorlton': { lat: 53.4550, lng: -2.2800, zoom: 13, clients: 18, volunteers: 7 },
  'Crumpsall': { lat: 53.5100, lng: -2.2400, zoom: 13, clients: 22, volunteers: 2 },
  'Didsbury West': { lat: 53.4100, lng: -2.2200, zoom: 13, clients: 15, volunteers: 6 },
  'Fallowfield': { lat: 53.4200, lng: -2.2100, zoom: 13, clients: 20, volunteers: 3 },
};

// Generate sample client locations within wards
function generateClientMarkers() {
  const markers = [];
  Object.entries(WARD_BOUNDS).forEach(([wardName, ward]) => {
    for (let i = 0; i < ward.clients; i++) {
      markers.push({
        id: `client-${wardName}-${i}`,
        type: 'client',
        ward: wardName,
        lat: ward.lat + (Math.random() - 0.5) * 0.05,
        lng: ward.lng + (Math.random() - 0.5) * 0.05,
        name: `Client ${i + 1}`,
        status: Math.random() > 0.7 ? 'active' : 'inactive',
      });
    }
  });
  return markers;
}

// Generate sample volunteer locations within wards
function generateVolunteerMarkers() {
  const markers = [];
  Object.entries(WARD_BOUNDS).forEach(([wardName, ward]) => {
    for (let i = 0; i < ward.volunteers; i++) {
      markers.push({
        id: `volunteer-${wardName}-${i}`,
        type: 'volunteer',
        ward: wardName,
        lat: ward.lat + (Math.random() - 0.5) * 0.05,
        lng: ward.lng + (Math.random() - 0.5) * 0.05,
        name: `Volunteer ${i + 1}`,
        role: ['befriender', 'driver', 'admin'][Math.floor(Math.random() * 3)],
      });
    }
  });
  return markers;
}

export default function ServiceGapMap() {
  const [mapView, setMapView] = useState('gaps'); // 'gaps', 'clients', 'volunteers'
  const [selectedWard, setSelectedWard] = useState(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  // Generate sample markers
  const clientMarkers = useMemo(() => generateClientMarkers(), []);
  const volunteerMarkers = useMemo(() => generateVolunteerMarkers(), []);

  // Calculate service gaps
  const wardAnalysis = useMemo(() => {
    const analysis = {};
    Object.entries(WARD_BOUNDS).forEach(([wardName, ward]) => {
      const clientCount = clientMarkers.filter(m => m.ward === wardName).length;
      const volunteerCount = volunteerMarkers.filter(m => m.ward === wardName).length;
      const ratio = volunteerCount > 0 ? (clientCount / volunteerCount).toFixed(1) : clientCount;
      
      analysis[wardName] = {
        clients: clientCount,
        volunteers: volunteerCount,
        clientToVolunteerRatio: ratio,
        gapLevel: 
          volunteerCount === 0 ? 'critical' :
          ratio > 10 ? 'high' :
          ratio > 5 ? 'medium' :
          'low',
      };
    });
    return analysis;
  }, [clientMarkers, volunteerMarkers]);

  const gapColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };

  const filteredClients = mapView === 'clients' ? clientMarkers : [];
  const filteredVolunteers = mapView === 'volunteers' ? volunteerMarkers : [];

  // For gaps view, show both but highlight gaps
  const showGapsView = mapView === 'gaps';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="w-6 h-6" /> Service Gap Map
        </h1>
        <div className="flex gap-2">
          <Button 
            variant={mapView === 'gaps' ? 'default' : 'outline'} 
            onClick={() => setMapView('gaps')}
            className="gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Service Gaps
          </Button>
          <Button 
            variant={mapView === 'clients' ? 'default' : 'outline'} 
            onClick={() => setMapView('clients')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Clients
          </Button>
          <Button 
            variant={mapView === 'volunteers' ? 'default' : 'outline'} 
            onClick={() => setMapView('volunteers')}
            className="gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Volunteers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical', color: 'bg-red-500', count: Object.values(wardAnalysis).filter(w => w.gapLevel === 'critical').length },
          { label: 'High', color: 'bg-orange-500', count: Object.values(wardAnalysis).filter(w => w.gapLevel === 'high').length },
          { label: 'Medium', color: 'bg-yellow-400', count: Object.values(wardAnalysis).filter(w => w.gapLevel === 'medium').length },
          { label: 'Low', color: 'bg-green-500', count: Object.values(wardAnalysis).filter(w => w.gapLevel === 'low').length },
        ].map(({ label, color, count }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{label} Gap</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div style={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={[53.48, -2.24]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Ward centers with gap indicators */}
            {showGapsView && Object.entries(WARD_BOUNDS).map(([wardName, ward]) => {
              const analysis = wardAnalysis[wardName];
              const color = gapColors[analysis.gapLevel];

              return (
                <CircleMarker
                  key={`ward-${wardName}`}
                  center={[ward.lat, ward.lng]}
                  radius={analysis.gapLevel === 'critical' ? 25 : analysis.gapLevel === 'high' ? 20 : 15}
                  pathOptions={{
                    fillColor: color,
                    color: '#fff',
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.6,
                  }}
                  onClick={() => setSelectedWard(wardName)}
                >
                  <Popup>
                    <div className="w-56 font-sans">
                      <h3 className="font-bold text-sm mb-2">{wardName}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <p className="text-muted-foreground">Clients</p>
                          <p className="font-bold">{analysis.clients}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volunteers</p>
                          <p className="font-bold">{analysis.volunteers}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Client:Volunteer Ratio</p>
                          <p className="font-bold">{analysis.clientToVolunteerRatio}:1</p>
                        </div>
                      </div>
                      <Badge style={{ backgroundColor: gapColors[analysis.gapLevel] }} className="text-white">
                        {analysis.gapLevel.charAt(0).toUpperCase() + analysis.gapLevel.slice(1)} Gap
                      </Badge>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Client markers */}
            {(showGapsView || mapView === 'clients') && clientMarkers.map(client => (
              <CircleMarker
                key={client.id}
                center={[client.lat, client.lng]}
                radius={5}
                pathOptions={{
                  fillColor: '#3b82f6',
                  color: '#fff',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8,
                }}
              >
                <Popup>
                  <div className="w-48 text-xs">
                    <p className="font-bold">{client.name}</p>
                    <p className="text-muted-foreground">{client.ward}</p>
                    <p className="mt-1">Status: <span className="font-medium">{client.status}</span></p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Volunteer markers */}
            {(showGapsView || mapView === 'volunteers') && volunteerMarkers.map(volunteer => (
              <CircleMarker
                key={volunteer.id}
                center={[volunteer.lat, volunteer.lng]}
                radius={6}
                pathOptions={{
                  fillColor: '#10b981',
                  color: '#fff',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8,
                }}
              >
                <Popup>
                  <div className="w-48 text-xs">
                    <p className="font-bold">{volunteer.name}</p>
                    <p className="text-muted-foreground">{volunteer.ward}</p>
                    <p className="mt-1">Role: <span className="font-medium">{volunteer.role}</span></p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* Ward Service Gap Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Ward Service Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(wardAnalysis).map(([wardName, analysis]) => (
              <div
                key={wardName}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedWard(wardName)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{wardName}</h3>
                  <Badge style={{ backgroundColor: gapColors[analysis.gapLevel] }} className="text-white text-xs">
                    {analysis.gapLevel}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Clients</p>
                    <p className="font-bold text-lg">{analysis.clients}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volunteers</p>
                    <p className="font-bold text-lg">{analysis.volunteers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ratio</p>
                    <p className="font-bold text-lg">{analysis.clientToVolunteerRatio}:1</p>
                  </div>
                </div>
                {analysis.gapLevel === 'critical' && (
                  <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Urgent: No volunteers assigned</p>
                )}
                {analysis.gapLevel === 'high' && (
                  <p className="text-xs text-orange-600 mt-2 font-medium">⚠️ Need more volunteer coverage</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}