import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Users, Heart, Target, FileText, X, Loader2 } from 'lucide-react';

const RECORD_TYPES = ['all', 'donor', 'volunteer', 'campaign', 'grant'];

const TYPE_COLORS = {
  donor: 'bg-blue-100 text-blue-800',
  volunteer: 'bg-green-100 text-green-800',
  campaign: 'bg-purple-100 text-purple-800',
  grant: 'bg-amber-100 text-amber-800'
};

const TYPE_ICONS = {
  donor: Heart,
  volunteer: Users,
  campaign: Target,
  grant: FileText
};

export default function CharitySmartSearch() {
  const [search, setSearch] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [donorStatus, setDonorStatus] = useState('all');
  const [volunteerAvail, setVolunteerAvail] = useState('all');
  const [campaignStatus, setCampaignStatus] = useState('all');
  const [grantDeadlineWithin, setGrantDeadlineWithin] = useState('all');
  const [donorAmountMin, setDonorAmountMin] = useState('');
  const [donorAmountMax, setDonorAmountMax] = useState('');

  const { data: charities } = useQuery({ queryKey: ['charities'], queryFn: () => base44.entities.Charity.list() });
  const charity = charities?.[0];
  const cid = charity?.id;

  const { data: donors = [], isLoading: loadD } = useQuery({ queryKey: ['donors', cid], queryFn: () => cid ? base44.entities.Donor.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: volunteers = [], isLoading: loadV } = useQuery({ queryKey: ['volunteers', cid], queryFn: () => cid ? base44.entities.Volunteer.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: campaigns = [], isLoading: loadC } = useQuery({ queryKey: ['campaigns', cid], queryFn: () => cid ? base44.entities.Campaign.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: grants = [], isLoading: loadG } = useQuery({ queryKey: ['grants', cid], queryFn: () => cid ? base44.entities.Grant.filter({ charity_id: cid }) : [], enabled: !!cid });

  const isLoading = loadD || loadV || loadC || loadG;

  const results = useMemo(() => {
    const q = search.toLowerCase();

    const matchDonors = (recordType === 'all' || recordType === 'donor') ? donors.filter(d => {
      if (q && !d.name?.toLowerCase().includes(q) && !d.email?.toLowerCase().includes(q)) return false;
      if (donorStatus !== 'all' && d.status !== donorStatus) return false;
      if (donorAmountMin && d.total_donated < parseFloat(donorAmountMin)) return false;
      if (donorAmountMax && d.total_donated > parseFloat(donorAmountMax)) return false;
      return true;
    }).map(d => ({ ...d, _type: 'donor', _title: d.name, _sub: d.email, _meta: `£${d.total_donated?.toLocaleString() || 0} total` })) : [];

    const matchVolunteers = (recordType === 'all' || recordType === 'volunteer') ? volunteers.filter(v => {
      if (q && !v.name?.toLowerCase().includes(q) && !v.email?.toLowerCase().includes(q)) return false;
      if (volunteerAvail !== 'all' && v.availability !== volunteerAvail) return false;
      return true;
    }).map(v => ({ ...v, _type: 'volunteer', _title: v.name, _sub: v.role, _meta: v.availability })) : [];

    const matchCampaigns = (recordType === 'all' || recordType === 'campaign') ? campaigns.filter(c => {
      if (q && !c.title?.toLowerCase().includes(q)) return false;
      if (campaignStatus !== 'all' && c.status !== campaignStatus) return false;
      return true;
    }).map(c => ({ ...c, _type: 'campaign', _title: c.title, _sub: c.status, _meta: `£${c.raised_amount?.toLocaleString() || 0} / £${c.goal_amount?.toLocaleString()}` })) : [];

    const matchGrants = (recordType === 'all' || recordType === 'grant') ? grants.filter(g => {
      if (q && !g.grant_name?.toLowerCase().includes(q) && !g.funder_name?.toLowerCase().includes(q)) return false;
      if (grantDeadlineWithin !== 'all') {
        const days = parseInt(grantDeadlineWithin);
        const daysUntil = (new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysUntil < 0 || daysUntil > days) return false;
      }
      return true;
    }).map(g => ({ ...g, _type: 'grant', _title: g.grant_name, _sub: g.funder_name, _meta: `£${g.amount?.toLocaleString()} — ${g.status}` })) : [];

    return [...matchDonors, ...matchVolunteers, ...matchCampaigns, ...matchGrants];
  }, [search, recordType, donorStatus, volunteerAvail, campaignStatus, grantDeadlineWithin, donorAmountMin, donorAmountMax, donors, volunteers, campaigns, grants]);

  const clearFilters = () => {
    setSearch(''); setRecordType('all'); setDonorStatus('all');
    setVolunteerAvail('all'); setCampaignStatus('all');
    setGrantDeadlineWithin('all'); setDonorAmountMin(''); setDonorAmountMax('');
  };

  const hasFilters = search || recordType !== 'all' || donorStatus !== 'all' || volunteerAvail !== 'all' || campaignStatus !== 'all' || grantDeadlineWithin !== 'all' || donorAmountMin || donorAmountMax;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Search</h1>
        <p className="text-gray-600 mt-1">Search across all your charity records</p>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={recordType} onValueChange={setRecordType}>
              <SelectTrigger><SelectValue placeholder="Record type" /></SelectTrigger>
              <SelectContent>
                {RECORD_TYPES.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>

            {(recordType === 'all' || recordType === 'donor') && (
              <Select value={donorStatus} onValueChange={setDonorStatus}>
                <SelectTrigger><SelectValue placeholder="Donor status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All donor statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                  <SelectItem value="major">Major donor</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(recordType === 'all' || recordType === 'volunteer') && (
              <Select value={volunteerAvail} onValueChange={setVolunteerAvail}>
                <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(recordType === 'all' || recordType === 'campaign') && (
              <Select value={campaignStatus} onValueChange={setCampaignStatus}>
                <SelectTrigger><SelectValue placeholder="Campaign status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All campaign statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(recordType === 'all' || recordType === 'grant') && (
              <Select value={grantDeadlineWithin} onValueChange={setGrantDeadlineWithin}>
                <SelectTrigger><SelectValue placeholder="Grant deadline" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any deadline</SelectItem>
                  <SelectItem value="30">Within 30 days</SelectItem>
                  <SelectItem value="60">Within 60 days</SelectItem>
                  <SelectItem value="90">Within 90 days</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(recordType === 'all' || recordType === 'donor') && (
              <>
                <Input placeholder="Min donation (£)" type="number" value={donorAmountMin} onChange={(e) => setDonorAmountMin(e.target.value)} />
                <Input placeholder="Max donation (£)" type="number" value={donorAmountMax} onChange={(e) => setDonorAmountMax(e.target.value)} />
              </>
            )}
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 text-gray-500">
              <X className="w-4 h-4" /> Clear all filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-500 mb-3">{isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No results found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {results.map((item) => {
              const Icon = TYPE_ICONS[item._type];
              return (
                <Card key={`${item._type}-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${TYPE_COLORS[item._type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{item._title}</span>
                          <Badge className={`text-xs shrink-0 ${TYPE_COLORS[item._type]}`}>{item._type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{item._sub}</p>
                      </div>
                      <p className="text-sm text-gray-700 font-medium shrink-0">{item._meta}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}