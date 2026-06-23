'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function RevenueChart({ data }: Readonly<{ data: any[] }>) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 w-full flex flex-col">
      <h3 className="font-bold text-gray-700 mb-4">Tren Omzet 7 Hari Terakhir</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(val) => `Rp ${(val/1000000).toFixed(1)}Jt`} 
              tick={{ fontSize: 12, fill: '#888' }}
              dx={-10}
            />
            <Tooltip 
              formatter={(value: any) => [formatRupiah(Number(value)), 'Omzet']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="omzet" 
              stroke="#00875A" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#00875A', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#00875A', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const COLORS = ['#00875A', '#E3A300', '#1E88E5', '#8E24AA'];

export function PaymentRatioChart({ data }: Readonly<{ data: any[] }>) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 w-full flex flex-col">
      <h3 className="font-bold text-gray-700 mb-4">Rasio Metode Pembayaran</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[data.indexOf(entry) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [formatRupiah(Number(value)), 'Total']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
