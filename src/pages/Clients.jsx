import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, AlertTriangle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { playClick, playSuccess, playError } from '@/lib/audio';
import { isPostcodeInCatchment } from '@/lib/branchCatchments';

export default function Clients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  const { isBranchView, filterData, currentBranch } = useBranchFilter();
  const [showOutOfCatchmentOnly, setShowOutOfCatchmentOnly] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const deleteClient = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: () => playError(),
  });

  const filtered = filterData(clients).filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) ||
                         c.postcode?.includes(search);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Flag clients whose postcode is outside the current branch catchment
  const catchmentFlags = useMemo(() => {
    const flags = {};
    if (!currentBranch) return flags;
    filtered.forEach(c => {
      if (c.postcode) {
        flags[c.id] = isPostcodeInCatchment(c.postcode, currentBranch);
      }
    });
    return flags;
  }, [filtered, currentBranch]);

  const outOfCatchmentCount = Object.values(catchmentFlags).filter(f => f.valid === false).length;

  const displayedClients = showOutOfCatchmentOnly
    ? filtered.filter(c => catchmentFlags[c.id]?.valid === false)
    : filtered;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    deceased: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">Clients</h1>
         <Button className="gap-2" onClick={playClick} disabled title="Client creation coming soon">
             <Plus className="w-4 h-4" />
             Add Client
           </Button>
       </div>

      {/* Out-of-catchment alert — only shown in branch view */}
      {currentBranch && outOfCatchmentCount > 0 && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">
              {outOfCatchmentCount} client{outOfCatchmentCount !== 1 ? 's' : ''} may be outside this branch's catchment area
            </span>
          </div>
          <button
            onClick={() => setShowOutOfCatchmentOnly(v => !v)}
            className={`text-xs px-3 py-1 rounded-md border font-medium transition-colors ${
              showOutOfCatchmentOnly
                ? 'bg-amber-200 border-amber-400 text-amber-900'
                : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {showOutOfCatchmentOnly ? 'Show all' : 'Show flagged only'}
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or postcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Postcode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Key Worker</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedClients.map(client => {
              const age = client.date_of_birth ? 
                Math.floor((new Date() - new Date(client.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
                '-';
              const catchmentFlag = catchmentFlags[client.id];
              const isOutside = catchmentFlag?.valid === false;
              return (
                <TableRow key={client.id} className={isOutside ? 'bg-amber-50/50' : ''}>
                  <TableCell className="font-medium">
                    <Link to={`/clients/${client.id}`} className="text-primary hover:underline">
                      {client.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{age}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span>{client.postcode || '-'}</span>
                      {isOutside && (
                        <span title={catchmentFlag.reason}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[client.status]}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{client.key_worker || '-'}</TableCell>
                  <TableCell className="text-sm">{client.date_registered ? new Date(client.date_registered).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Button size="sm" variant="ghost" onClick={playClick} disabled title="Edit coming soon">
                         <Pencil className="w-4 h-4" />
                       </Button>
                       <Button 
                         size="sm" 
                         variant="ghost" 
                         onClick={() => {
                           playClick();
                           deleteClient.mutate(client.id);
                         }}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {displayedClients.length} of {clients.length} clients
        {currentBranch && outOfCatchmentCount > 0 && !showOutOfCatchmentOnly && (
          <span className="ml-2 text-amber-600">· {outOfCatchmentCount} outside catchment</span>
        )}
      </div>
    </div>
  );
}