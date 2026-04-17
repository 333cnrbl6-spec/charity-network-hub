import React, { useEffect, useRef, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

// Load ArcGIS Maps SDK
if (typeof window !== 'undefined' && !window.esriLoaded) {
  const script = document.createElement('script');
  script.src = 'https://js.arcgis.com/4.27/';
  script.onload = () => {
    window.esriLoaded = true;
  };
  document.head.appendChild(script);
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://js.arcgis.com/4.27/esri/themes/light/main.css';
  document.head.appendChild(link);
}

// Branch coordinates (UK locations)
const BRANCH_COORDS = {
  manchester: { lat: 53.4808, lng: -2.2426, region: 'north_west' },
  bury: { lat: 53.5931, lng: -2.2968, region: 'north_west' },
  stockport: { lat: 53.4084, lng: -2.1636, region: 'north_west' },
  wigan: { lat: 53.5440, lng: -2.6275, region: 'north_west' },
  trafford: { lat: 53.4101, lng: -2.3425, region: 'north_west' },
  salford: { lat: 53.4876, lng: -2.2908, region: 'north_west' },
  bolton: { lat: 53.5761, lng: -2.4273, region: 'north_west' },
  lancashire: { lat: 54.0406, lng: -2.2719, region: 'north_west' },
  wirral: { lat: 53.3764, lng: -3.0180, region: 'north_west' },
  sefton: { lat: 53.4719, lng: -2.8597, region: 'north_west' },
  liverpool: { lat: 53.4084, lng: -2.9916, region: 'north_west' },
};

const REGIONS = {
  north_west: 'North West',
  london: 'London',
  south_east: 'South East',
  south_west: 'South West',
  midlands: 'Midlands',
  north_east: 'North East',
  yorkshire: 'Yorkshire',
  east_midlands: 'East Midlands',
  east: 'East',
  wales: 'Wales',
};

export default function BranchLocationMap({ branches, selectedRegion = 'all', onSelectBranch }) {
  const mapContainer = useRef(null);
  const mapView = useRef(null);

  const filteredBranches = useMemo(() => {
    return Object.entries(BRANCH_COORDS).filter(([branchId]) => {
      if (selectedRegion === 'all') return true;
      return BRANCH_COORDS[branchId].region === selectedRegion;
    }).map(([branchId, coords]) => {
      const branchData = branches?.find(b => b.branch_id === branchId);
      return {
        id: branchId,
        ...coords,
        isOnline: branchData?.status === 'active',
        branchData
      };
    });
  }, [branches, selectedRegion]);

  useEffect(() => {
    if (!window.esri || !mapContainer.current) return;

    const { Map, MapView, Graphic, GraphicsLayer, SimpleMarkerSymbol, Point } = window.esri;

    const initMap = async () => {
      // Create map
      const map = new window.esri.Map({
        basemap: 'arcgis-streets-relief'
      });

      // Calculate center
      const mapCenter = filteredBranches.length > 0 
        ? {
            longitude: filteredBranches.reduce((sum, b) => sum + b.lng, 0) / filteredBranches.length,
            latitude: filteredBranches.reduce((sum, b) => sum + b.lat, 0) / filteredBranches.length
          }
        : { longitude: -3.4360, latitude: 54.5973 };

      // Create view
      const view = new window.esri.MapView({
        container: mapContainer.current,
        map: map,
        center: [mapCenter.longitude, mapCenter.latitude],
        zoom: selectedRegion === 'all' ? 6 : 10
      });

      // Create graphics layer
      const graphicsLayer = new window.esri.GraphicsLayer();
      map.add(graphicsLayer);

      // Add branch markers
      filteredBranches.forEach(branch => {
        const symbol = new window.esri.SimpleMarkerSymbol({
          color: branch.isOnline ? [34, 197, 94] : [239, 68, 68],
          outline: {
            color: branch.isOnline ? [22, 163, 74] : [220, 38, 38],
            width: 2
          },
          size: branch.isOnline ? 12 : 9
        });

        const point = new window.esri.Point({
          longitude: branch.lng,
          latitude: branch.lat
        });

        const graphic = new window.esri.Graphic({
          geometry: point,
          symbol: symbol,
          attributes: {
            id: branch.id,
            name: branch.id,
            status: branch.isOnline ? 'Online' : 'Offline'
          },
          popupTemplate: {
            title: '<strong class="capitalize">{name}</strong>',
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  { fieldName: 'status', label: 'Status' }
                ]
              }
            ]
          }
        });

        graphic.addEventListener('click', () => {
          onSelectBranch?.(branch.id);
        });

        graphicsLayer.add(graphic);
      });

      mapView.current = view;
    };

    initMap();

    return () => {
      if (mapView.current) {
        mapView.current.destroy();
      }
    };
  }, [filteredBranches, selectedRegion, onSelectBranch]);

  return (
    <div 
      ref={mapContainer}
      className="w-full h-96 rounded-lg border overflow-hidden bg-white"
    />
  );
}