import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Textarea as TextareaUI } from '@/components/ui/textarea';

export default function ProgressTracker({ referral, onAddNote, loading }) {
  const [noteText, setNoteText] = useState('');

  const progressSteps = [
    { status: 'received', label: 'Referral Received', date: referral.referral_date },
    { status: 'qualified', label: 'Qualified', date: referral.qualified_date },
    { status: 'assigned', label: 'Assigned', date: referral.assigned_date },
    { status: 'active', label: 'Service Active', date: referral.service_start_date },
  ];

  const currentIndex = progressSteps.findIndex(s => s.status === referral.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progress Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-3">
          {progressSteps.map((step, index) => {
            const isComplete = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isComplete
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        isComplete ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-medium text-sm ${isCurrent ? 'text-primary' : ''}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(step.date).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Notes */}
        {referral.progress_notes && referral.progress_notes.length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">Progress Updates</p>
            {referral.progress_notes.map((note, index) => (
              <div key={index} className="p-2 bg-muted rounded text-sm">
                <p className="font-medium text-xs text-muted-foreground">
                  {new Date(note.date).toLocaleDateString()} • {note.added_by}
                </p>
                <p className="mt-1">{note.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Note */}
        {referral.status === 'assigned' || referral.status === 'active' && (
          <div className="pt-4 border-t space-y-2">
            <label className="text-sm font-medium">Add Progress Note</label>
            <Textarea
              placeholder="Update on referral progress..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-16"
            />
            <Button
              onClick={() => {
                onAddNote(noteText);
                setNoteText('');
              }}
              disabled={!noteText || loading}
              size="sm"
              className="w-full"
            >
              Add Note
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}