import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function TeamProductivityChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Productivity</CardTitle>
        <CardDescription>Task completion by team member</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="assigned" fill="#3b82f6" name="Assigned" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}