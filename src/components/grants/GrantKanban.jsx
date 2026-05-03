import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertCircle, Plus } from 'lucide-react';

const STAGES = ['prospecting', 'submitted', 'awarded', 'rejected'];
const STAGE_LABELS = {
  prospecting: 'Prospecting',
  submitted: 'Submitted',
  awarded: 'Awarded',
  rejected: 'Rejected'
};

const STAGE_COLORS = {
  prospecting: 'bg-blue-100 text-blue-900',
  submitted: 'bg-purple-100 text-purple-900',
  awarded: 'bg-green-100 text-green-900',
  rejected: 'bg-red-100 text-red-900'
};

export default function GrantKanban({ charityId, onGrantSelect }) {
  const [grants, setGrants] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    loadGrants();
  }, [charityId]);

  const loadGrants = async () => {
    try {
      const allGrants = await base44.entities.Grant.filter({
        charity_id: charityId
      }, '-deadline');

      // Group by status
      const grouped = {
        prospecting: [],
        submitted: [],
        awarded: [],
        rejected: []
      };

      allGrants?.forEach(grant => {
        const status = grant.status || 'prospecting';
        if (grouped[status]) {
          grouped[status].push(grant);
        } else {
          grouped.prospecting.push(grant);
        }
      });

      setGrants(grouped);
    } catch (error) {
      console.error('Failed to load grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    const grantId = draggableId;

    // Find the grant
    const grant = grants[sourceStage]?.find(g => g.id === grantId);
    if (!grant) return;

    // Update local state optimistically
    const newGrants = { ...grants };
    newGrants[sourceStage] = newGrants[sourceStage].filter(g => g.id !== grantId);
    grant.status = destStage;
    newGrants[destStage] = [...newGrants[destStage], grant];
    setGrants(newGrants);

    // Update backend
    try {
      setNotifying(true);
      await base44.entities.Grant.update(grantId, { status: destStage });

      // Send notifications
      await base44.functions.invoke('handleGrantStatusChange', {
        grant_id: grantId,
        new_status: destStage,
        charity_id: charityId
      });
    } catch (error) {
      console.error('Failed to update grant:', error);
      // Revert on error
      await loadGrants();
    } finally {
      setNotifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {STAGES.map(stage => (
          <div key={stage}>
            <div className="mb-3">
              <h3 className="font-semibold text-sm text-foreground">
                {STAGE_LABELS[stage]}
              </h3>
              <p className="text-xs text-muted-foreground">
                {grants[stage]?.length || 0} grants
              </p>
            </div>

            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[400px] rounded-lg p-3 transition-colors ${
                    snapshot.isDraggingOver
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/30 border-2 border-transparent'
                  }`}
                >
                  {grants[stage]?.map((grant, index) => (
                    <Draggable key={grant.id} draggableId={grant.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3"
                          onClick={() => onGrantSelect?.(grant)}
                        >
                          <Card
                            className={`cursor-grab active:cursor-grabbing transition-all ${
                              snapshot.isDragging
                                ? 'shadow-lg scale-105 opacity-100'
                                : 'hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground line-clamp-2">
                                    {grant.grant_name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {grant.funder_name}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-primary">
                                    £{grant.amount?.toLocaleString() || '—'}
                                  </span>
                                  <Badge variant="outline" className={STAGE_COLORS[stage]}>
                                    {stage}
                                  </Badge>
                                </div>

                                {grant.deadline && (
                                  <div className="text-xs text-muted-foreground">
                                    Deadline: {format(new Date(grant.deadline), 'MMM d')}
                                  </div>
                                )}

                                {grant.deadline &&
                                  new Date(grant.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                                  new Date(grant.deadline) > new Date() && (
                                    <div className="flex items-center gap-1 text-yellow-700 text-xs bg-yellow-50 p-1.5 rounded">
                                      <AlertCircle className="w-3 h-3" />
                                      Deadline soon
                                    </div>
                                  )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}