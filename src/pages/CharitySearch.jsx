import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, UserCheck, Briefcase, Gift, X } from 'lucide-react';

const ENTITY_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'client', label: 'Clients', icon: Users },
  { id: 'volunteer', label: 'Volunteers', icon: UserCheck },
  { id: 'job', label: 'Jobs', icon: Briefcase },
  { id: 'grant', label: 'Grants', icon: Gift },
];

export default function CharitySearch() {
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => base44.entities.Client.list() });
  const { data: volunteers = [] } = useQuery({ queryKey: ['volunteers'], queryFn: () => base44.entities.Volunteer.list() });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => base44.entities.Job.list() });
  const { data: grants = [] } = useQuery({ queryKey: ['grants'], queryFn: () => base44.entities.Grant.list() });

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const all = [];

    if (entityType === 'all' || entityType === 'client') {
      clients
        .filter(c => {
          const matchQ = !q || c.full_name?.toLowerCase().includes(q) || c.postcode?.toLowerCase().includes(q);
          const matchS = statusFilter === 'all' || c.status === statusFilter;
          return matchQ && matchS;
        })
        .forEach(c => all.push({ type: 'client', id: c.id, title: c.full_name, subtitle: `${c.postcode || ''} • ${c.status}`, status: c.status, extra: c.key_worker ? `Key worker: ${c.key_worker}` : '' }));
    }

    if (entityType === 'all' || entityType === 'volunteer') {
      volunteers
        .filter(v => {
          const matchQ = !q || v.full_name?.toLowerCase().includes(q) || v.role?.toLowerCase().includes(q);
          const matchS = statusFilter === 'all' || v.status === statusFilter;
          return matchQ && matchS;
        })
        .forEach(v => all.push({ type: 'volunteer', id: v.id, title: v.full_name, subtitle: `${v.role || 'Volunteer'} • ${v.status}`, status: v.status, extra: v.area || '' }));
    }

    if (entityType === 'all' || entityType === 'job') {
      jobs
        .filter(j => {
          const matchQ = !q || j.client_name?.toLowerCase().includes(q) || j.job_type?.toLowerCase().includes(q) || j.volunteer_name?.toLowerCase().includes(q);
          const matchS = statusFilter === 'all' || j.status === statusFilter;
          return matchQ && matchS;
        })
        .forEach(j => all.push({ type: 'job', id: j.id, title: `${j.job_type?.replace('-', ' ')} — ${j.client_name}`, subtitle: `${j.status} • ${j.volunteer_name || 'Unassigned'}`, status: j.status, extra: j.scheduled_date ? new Date(j.scheduled_date).toLocaleDateString() : '' }));
    }

    if (entityType === 'all' || entityType === 'grant') {
      grants
        .filter(g => {
          const matchQ = !q || g.grant_name?.toLowerCase().includes(q) || g.funder?.toLowerCase().includes(q) || g.client_name?.toLowerCase().includes(q);
          const matchS = statusFilter === 'all' || g.status === statusFilter;
          const matchMin = !amountMin || (g.amount_awarded || 0) >= parseFloat(amountMin);
          const matchMax = !amountMax || (g.amount_awarded || 0) <= parseFloat(amountMax);
          return matchQ && matchS && matchMin && matchMax;
        })
        .forEach(g => all.push({ type: 'grant', id: g.id, title: g.grant_name, subtitle: `${g.funder || 'Unknown funder'} • ${g.status}`, status: g.status, extra: g.amount_awarded ? `£${g.amount_awarded.toLocaleString()}` : '' }));
    }

    return all;
  }, [query, entityType, statusFilter, amountMin, amountMax, clients, volunteers, jobs, grants]);

  const typeColors = {
    client: 'bg-blue-100 text-blue-800',
    volunteer: 'bg-green-100 text-green-800',
    job: 'bg-purple-100 text-purple-800',
    grant: 'bg-amber-100 text-amber-800',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-indigo-100 text-indigo-800',
    awarded: 'bg-green-100 text-green-800',
    applied: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const clearFilters = () => {
    setQuery('');
    setEntityType('all');
    setStatusFilter('all');
    setAmountMin('');
    setAmountMax('');
  };

  const hasFilters = query || entityType !== 'all' || statusFilter !== 'all' || amountMin || amountMax;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="w-7 h-7 text-primary" />
          Smart Search
        </h1>
        <p className="text-muted-foreground mt-1">Search across clients, volunteers, jobs, and grants</p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, postcode, role, funder..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10 text-base"
            />
          </div>

          {/* Entity type tabs */}
          <div className="flex flex-wrap gap-2">
            {ENTITY_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setEntityType(t.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${entityType === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Extra filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white"
            >
              <option value="all">Any Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="applied">Applied</option>
              <option value="awarded">Awarded</option>
            </select>
            {(entityType === 'all' || entityType === 'grant') && (
              <>
                <Input placeholder="Min £" value={amountMin} onChange={e => setAmountMin(e.target.value)} className="w-24 text-sm" />
                <Input placeholder="Max £" value={amountMax} onChange={e => setAmountMax(e.target.value)} className="w-24 text-sm" />
              </>
            )}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</p>
        {results.map((r, idx) => (
          <Card key={`${r.type}-${r.id}-${idx}`} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{r.title}</p>
                  <Badge className={typeColors[r.type]}>{r.type}</Badge>
                  <Badge className={statusColors[r.status] || 'bg-gray-100 text-gray-800'}>{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>
              </div>
              {r.extra && <span className="text-sm font-medium text-muted-foreground shrink-0">{r.extra}</span>}
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && hasFilters && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No results found. Try adjusting your filters.</p>
          </div>
        )}
        {!hasFilters && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Start typing to search across all records.</p>
          </div>
        )}
      </div>
    </div>
  );
}