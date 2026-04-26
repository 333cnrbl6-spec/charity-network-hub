import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Target, Zap } from 'lucide-react';
import BranchHealthScores from '../components/intelligence/BranchHealthScores';
import OpportunityIntelligence from '../components/intelligence/OpportunityIntelligence';
import DemandForecasting from '../components/intelligence/DemandForecasting';
import PortfolioOptimization from '../components/intelligence/PortfolioOptimization';

export default function NetworkIntelligence() {
  const [activeTab, setActiveTab] = useState('health');

  // Fetch core data for all modules
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.entities.LocationConfig.list(),
    staleTime: 300000,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    staleTime: 300000,
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
    staleTime: 300000,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list(),
    staleTime: 300000,
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => base44.entities.Referral.list(),
    staleTime: 300000,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Network Intelligence Hub</h1>
        <p className="text-muted-foreground">
          Data-driven insights to optimize branch performance, identify growth opportunities, and forecast demand
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Health Scores</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Demand</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <BranchHealthScores branches={branches} clients={clients} volunteers={volunteers} jobs={jobs} referrals={referrals} />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunityIntelligence branches={branches} referrals={referrals} />
        </TabsContent>

        <TabsContent value="demand">
          <DemandForecasting branches={branches} clients={clients} referrals={referrals} />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioOptimization branches={branches} clients={clients} jobs={jobs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}