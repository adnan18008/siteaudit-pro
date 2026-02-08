import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrafficData, DeviceData } from '../types';

// Helper to format large numbers for charts
const formatAxisNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const TrafficChart = ({ data }: { data: TrafficData[] }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            tickFormatter={formatAxisNumber} 
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [formatAxisNumber(value), 'Visits']}
          />
          <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DeviceDistributionChart = ({ data }: { data: DeviceData[] }) => {
  const COLORS = ['#3b82f6', '#93c5fd', '#e2e8f0'];

  return (
    <div className="h-[250px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-24">
        <span className="block text-2xl font-bold text-slate-800">100%</span>
        <span className="text-xs text-slate-500">Traffic</span>
      </div>
    </div>
  );
};

export const MarketingChannelsChart = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};