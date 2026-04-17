import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Users, MessageSquare, FileText } from 'lucide-react';

// Mock data
const PRODUCTS = [
  { id: 'age-uk-bury', name: 'Age UK Bury', parity: 92, status: 'strong', revenue: '£45k', clients: 1240 },
  { id: 'premiso', name: 'Premiso', parity: 78, status: 'stable', revenue: '£28k', clients: 650 },
  { id: 'species-explorer', name: 'Species Explorer', parity: 65, status: 'developing', revenue: '£12k', clients: 2100 },
  { id: 'case-narrative', name: 'CaseNarrative', parity: 71, status: 'stable', revenue: '£18k', clients: 890 }
];

const DISCUSSIONS = [
  {
    id: 1,
    channel: '#strategy',
    author: 'Chairman',
    message: 'Q2 focus: drive Species Explorer parity to 80+. Cross-sell opportunities with Premiso identified.',
    timestamp: '2 hours ago',
    replies: 3
  },
  {
    id: 2,
    channel: '#products',
    author: 'Premiso PM',
    message: 'CaseNarrative integration proposal ready for review. Could unlock 180+ shared clients.',
    timestamp: '5 hours ago',
    replies: 7
  },
  {
    id: 3,
    channel: '#prospects',
    author: 'Sales Lead',
    message: 'Enterprise prospect interested in unified platform approach. All four products.',
    timestamp: '1 day ago',
    replies: 12
  },
  {
    id: 4,
    channel: '#governance',
    author: 'Chairman',
    message: 'Monthly parity review: all products healthy. Next sync Tuesday 10am.',
    timestamp: '3 days ago',
    replies: 2
  }
];

const PROPOSALS = [
  {
    id: 1,
    title: 'Species Explorer Revenue Share Model',
    proposedBy: 'Product Lead',
    status: 'pending',
    deadline: 'Apr 19',
    description: 'Adjust incentive structure to accelerate parity growth'
  },
  {
    id: 2,
    title: 'Shared Data Layer - Phase 2',
    proposedBy: 'CTO',
    status: 'pending',
    deadline: 'Apr 21',
    description: 'Enable real-time sync across all four products'
  },
  {
    id: 3,
    title: 'Joint Marketing Campaign',
    proposedBy: 'Marketing',
    status: 'approved',
    deadline: 'Apr 18',
    description: 'Q2 enterprise outreach targeting +£50k ARR'
  }
];

const ParityIndicator = ({ score, status }) => {
  const color = score >= 85 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-600';
  const bgColor = score >= 85 ? 'bg-green-50' : score >= 70 ? 'bg-amber-50' : 'bg-red-50';
  return (
    <div className={`${bgColor} rounded-lg p-3 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{score}</div>
      <div className="text-xs text-muted-foreground capitalize mt-1">{status}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const variants = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    developing: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return (
    <Badge className={`${variants[status] || variants.pending} border`}>
      {status}
    </Badge>
  );
};

export default function Boardroom() {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const totalParity = Math.round(PRODUCTS.reduce((sum, p) => sum + p.parity, 0) / PRODUCTS.length);
  const totalRevenue = PRODUCTS.reduce((sum, p) => parseInt(p.revenue) * 1000, 0);
  const totalClients = PRODUCTS.reduce((sum, p) => sum + p.clients, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">SynergyFlow Boardroom</h1>
        <p className="text-muted-foreground">Collective performance, parity metrics, and strategic governance</p>
      </div>

      {/* Collective Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collective Parity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParity}</div>
            <p className="text-xs text-green-600 mt-1">↑ 3 points this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(totalRevenue / 1000).toFixed(0)}k</div>
            <p className="text-xs text-green-600 mt-1">↑ 12% YoY</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">↑ 8% growth</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Tue 10am</div>
            <p className="text-xs text-muted-foreground mt-1">Apr 21, 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Parity Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Product Parity Scores
          </CardTitle>
          <CardDescription>Real-time performance alignment across collective</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PRODUCTS.map(product => (
              <div key={product.id} className="space-y-2">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <ParityIndicator score={product.parity} status={product.status} />
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>Revenue: {product.revenue}</p>
                  <p>Clients: {product.clients}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board Discussions Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Board Discussions
            </CardTitle>
            <CardDescription>Recent strategic conversations across channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DISCUSSIONS.map(discussion => (
              <div key={discussion.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{discussion.channel}</Badge>
                      <span className="text-xs text-muted-foreground">{discussion.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{discussion.author}</p>
                    <p className="text-sm">{discussion.message}</p>
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline mt-2">
                  {discussion.replies} replies →
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Proposals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proposals
            </CardTitle>
            <CardDescription>Awaiting Chairman review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROPOSALS.map(proposal => (
              <div
                key={proposal.id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedProposal(proposal)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium leading-snug">{proposal.title}</h4>
                  <StatusBadge status={proposal.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{proposal.proposedBy}</p>
                <p className="text-xs mb-2">{proposal.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {proposal.deadline}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{selectedProposal.title}</CardTitle>
              <CardDescription>{selectedProposal.proposedBy}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{selectedProposal.description}</p>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="text-muted-foreground mb-1">Status: <StatusBadge status={selectedProposal.status} /></p>
                <p className="text-muted-foreground">Deadline: {selectedProposal.deadline}</p>
              </div>
              {selectedProposal.status === 'pending' && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedProposal(null)}>
                    Reject
                  </Button>
                  <Button className="flex-1" onClick={() => setSelectedProposal(null)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              {selectedProposal.status !== 'pending' && (
                <Button variant="outline" className="w-full" onClick={() => setSelectedProposal(null)}>
                  Close
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}