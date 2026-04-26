import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';

export default function SessionDetailPanel({ session, onUpdate, onClose, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    session_name: session.session_name,
    location: session.location,
    facilitator: session.facilitator || '',
    max_capacity: session.max_capacity,
    notes: session.notes || '',
  });
  const [newAttendee, setNewAttendee] = useState('');
  const [attendees, setAttendees] = useState(session.attendees || []);

  const handleSave = () => {
    onUpdate({
      ...formData,
      attendees,
      attendees_count: attendees.length,
    });
    setIsEditing(false);
  };

  const addAttendee = () => {
    if (newAttendee.trim()) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee('');
    }
  };

  const removeAttendee = (index) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-end md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-96">
      <Card className="w-full md:h-screen md:rounded-none rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background border-b flex items-center justify-between">
          <CardTitle className="text-base">{session.session_name}</CardTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 pb-20">
          {/* Session Info */}
          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{session.session_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{session.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Facilitator</p>
                <p className="font-medium">{session.facilitator || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-medium">{session.max_capacity} spots</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                Edit Details
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Session Name</label>
                <Input
                  value={formData.session_name}
                  onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Facilitator</label>
                <Input
                  value={formData.facilitator}
                  onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                  className="mt-1"
                  placeholder="Name or TBD"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Max Capacity</label>
                <Input
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 min-h-16 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                  size="sm"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Attendees */}
          <div className="border-t pt-4 space-y-3">
            <div>
              <p className="font-medium text-sm mb-2">
                Registered Attendees ({attendees.length}/{session.max_capacity})
              </p>
              <div className="space-y-2">
                {attendees.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No attendees registered yet</p>
                ) : (
                  attendees.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{name}</span>
                      <button
                        onClick={() => removeAttendee(idx)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Attendee */}
            {attendees.length < session.max_capacity && (
              <div className="flex gap-2">
                <Input
                  placeholder="Attendee name..."
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                  className="text-sm h-8"
                />
                <Button
                  onClick={addAttendee}
                  size="sm"
                  className="px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}