import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function SmartSearch({ data = [], entityType = 'all' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    entity_type: 'all',
    donor_status: 'all',
    volunteer_availability: 'all',
    campaign_status: 'all',
    donation_min: 0,
    donation_max: 10000
  });

  const results = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesEntityType = filters.entity_type === 'all' || item.entity_type === filters.entity_type;
      const matchesDonorStatus = filters.donor_status === 'all' || item.status === filters.donor_status;
      const matchesAvailability = filters.volunteer_availability === 'all' || item.availability === filters.volunteer_availability;
      const matchesCampaignStatus = filters.campaign_status === 'all' || item.status === filters.campaign_status;
      const matchesDonationAmount = item.amount >= filters.donation_min && item.amount <= filters.donation_max;

      return matchesSearch && matchesEntityType && matchesDonorStatus && matchesAvailability && 
             matchesCampaignStatus && matchesDonationAmount;
    });
  }, [data, searchTerm, filters]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by name, email, title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select value={filters.entity_type} onValueChange={(value) => setFilters({...filters, entity_type: value})}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="donor">Donor</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
            <SelectItem value="grant">Grant</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.donor_status} onValueChange={(value) => setFilters({...filters, donor_status: value})}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Donor Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="lapsed">Lapsed</SelectItem>
            <SelectItem value="major">Major</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.volunteer_availability} onValueChange={(value) => setFilters({...filters, volunteer_availability: value})}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.campaign_status} onValueChange={(value) => setFilters({...filters, campaign_status: value})}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Campaign Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-gray-600">
        Found {results.length} result{results.length !== 1 ? 's' : ''}
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="ml-2 text-blue-600 hover:underline">
            Clear search
          </button>
        )}
      </div>

      <div className="space-y-2">
        {results.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:border-blue-400">
            <CardContent className="py-3">
              <p className="font-semibold text-sm">{item.name || item.title}</p>
              <p className="text-xs text-gray-600">{item.email || item.status || item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}