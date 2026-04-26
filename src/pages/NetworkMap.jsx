import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Gift, Activity, Clock, Map } from 'lucide-react';

// Accurate lat/lng for each North West branch
const BRANCH_COORDS = {
  manchester:        { lat: 53.4808, lng: -2.2426 },
  bury:              { lat: 53.5933, lng: -2.2986 },
  stockport:         { lat: 53.4083, lng: -2.1494 },
  bolton:            { lat: 53.5780, lng: -2.4282 },
  salford_trafford:  { lat: 53.4826, lng: -2.2913 },
  lancashire:        { lat: 53.7632, lng: -2.7044 },
  cheshire:          { lat: 53.1910, lng: -2.8910 },
  cumbria:           { lat: 54.8951, lng: -2.9382 },
  wirral:            { lat: 53.3727, lng: -3.0739 },
  halton_warrington: { lat: 53.3900, lng: -2.5972 },
  st_helens:         { lat: 53.4540, lng: -2.7360 },
  knowsley:          { lat: 53.4538, lng: -2.8530 },
  oldham:            { lat: 53.5409, lng: -2.1114 },
  rochdale:          { lat: 53.6143, lng: -2.1602 },
  tameside:          { lat: 53.4804, lng: -2.0831 },
  wigan:             { lat: 53.5450, lng: -2.6370 },
};

const STATUS_COLORS = {
  online:  '#22c55e',
  stale:   '#eab308',
  pending: '#3b82f6',
  offline: '#ef4444',
};

function getConnectionStatus(branchId, branchConfigs, branchReports) {
  const config = branchConfigs.find(b => b.branch_id === branchId);
  if (!config) return { status: 'offline', lastSync: null, report: null };

  const lastReport = branchReports
    .filter(r => r.branch_id === branchId)
    .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))[0];

  if (!lastReport) return { status: 'pending', lastSync: null, report: null };

  const hoursAgo = Math.floor((Date.now() - new Date(lastReport.received_at).getTime()) / (1000 * 60 * 60));
  return {
    status: hoursAgo > 24 ? 'stale' : 'online',
    lastSync: lastReport.received_at,
    hoursAgo,
    report: lastReport,
  };
}

function BranchPopupContent({ branch, status }) {
  const stats = status.report?.stats || {};
  const statusLabels = { online: 'Online', stale: 'Stale', pending: 'Pending', offline: 'Offline' };
  const statusVariants = { online: 'default', stale: 'secondary', pending: 'outline', offline: 'destructive' };

  return (
    <div className="w-64 font-sans" style={{ fontFamily: 'inherit' }}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <h3 className="font-bold text-sm leading-tight">{branch.name}</h3>
        <Badge variant={statusVariants[status.status]} className="text-xs shrink-0 ml-2">
          {statusLabels[status.status]}
        </Badge>
      </div>

      {status.lastSync && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock className="w-3 h-3" />
          <span>Last sync: {status.hoursAgo}h ago</span>
        </div>
      )}

      {stats.total_clients ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-0.5">
              <Users className="w-3 h-3" /> Clients
            </p>
            <p className="font-bold text-sm">{stats.total_clients}</p>
            {stats.new_clients ? <p className="text-xs text-green-600">+{stats.new_clients} new</p> : null}
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-0.5">
              <Activity className="w-3 h-3" /> Volunteers
            </p>
            <p className="font-bold text-sm">{stats.active_volunteers || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-0.5">
              <Briefcase className="w-3 h-3" /> Jobs
            </p>
            <p className="font-bold text-sm">{stats.total_jobs || 0}</p>
            {stats.completed_jobs ? <p className="text-xs text-gray-400">{stats.completed_jobs} done</p> : null}
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-0.5">
              <Gift className="w-3 h-3" /> Grants
            </p>
            <p className="font-bold text-sm">£{((stats.grants_total_value || 0) / 1000).toFixed(0)}k</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-2">No report data available</p>
      )}
    </div>
  );
}

const BRANCHES = [
  { id: 'bury',              name: 'Age UK Bury' },
  { id: 'manchester',        name: 'Age UK Manchester' },
  { id: 'stockport',         name: 'Age UK Stockport' },
  { id: 'bolton',            name: 'Age UK Bolton' },
  { id: 'salford_trafford',  name: 'Age UK Salford & Trafford' },
  { id: 'lancashire',        name: 'Age UK Lancashire' },
  { id: 'cheshire',          name: 'Age UK Cheshire' },
  { id: 'cumbria',           name: 'Age UK Cumbria' },
  { id: 'wirral',            name: 'Age UK Wirral' },
  { id: 'halton_warrington', name: 'Age UK Halton & Warrington' },
  { id: 'st_helens',         name: 'Age UK St Helens' },
  { id: 'knowsley',          name: 'Age UK Knowsley' },
  { id: 'oldham',            name: 'Age UK Oldham' },
  { id: 'rochdale',          name: 'Age UK Rochdale' },
  { id: 'tameside',          name: 'Age UK Tameside' },
  { id: 'wigan',             name: 'Age UK Wigan Borough' },
];

export default function NetworkMap() {
  const { data: branchConfigs = [] } = useQuery({
    queryKey: ['branchConfigs'],
    queryFn: () => base44.entities.BranchConfig.list(),
    refetchInterval: 15000,
  });

  const { data: branchReports = [] } = useQuery({
    queryKey: ['branchReports'],
    queryFn: () => base44.entities.BranchReport.list(),
    refetchInterval: 15000,
  });

  const statusCounts = BRANCHES.reduce((acc, b) => {
    const s = getConnectionStatus(b.id, branchConfigs, branchReports).status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="p-5 pb-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6" /> Network Map
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Click any marker to view branch status and metrics</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Online', status: 'online', color: 'bg-green-500' },
            { label: 'Stale',  status: 'stale',  color: 'bg-yellow-400' },
            { label: 'Pending', status: 'pending', color: 'bg-blue-500' },
            { label: 'Offline', status: 'offline', color: 'bg-red-500' },
          ].map(({ label, status, color }) => (
            <div key={status} className="flex items-center gap-1.5 text-sm">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{statusCounts[status] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 mx-5 mb-5 rounded-xl overflow-hidden border shadow-sm">
        <MapContainer
          center={[53.8, -2.5]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {BRANCHES.map(branch => {
            const coords = BRANCH_COORDS[branch.id];
            if (!coords) return null;

            const status = getConnectionStatus(branch.id, branchConfigs, branchReports);
            const color = STATUS_COLORS[status.status];

            return (
              <CircleMarker
                key={branch.id}
                center={[coords.lat, coords.lng]}
                radius={12}
                pathOptions={{
                  fillColor: color,
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.9,
                }}
              >
                <Popup maxWidth={280} className="branch-popup">
                  <BranchPopupContent branch={branch} status={status} />
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}