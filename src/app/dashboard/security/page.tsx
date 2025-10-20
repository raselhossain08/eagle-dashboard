'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function SecurityPage() {
  const { securityAlerts, activeSessions } = useAuthStore();
  const [showSensitive, setShowSensitive] = useState(false);

  const securityStats = {
    highAlerts: securityAlerts.filter(a => a.severity === 'high').length,
    mediumAlerts: securityAlerts.filter(a => a.severity === 'medium').length,
    lowAlerts: securityAlerts.filter(a => a.severity === 'low').length,
    activeSessions: activeSessions.length,
  };

  const SecurityStatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage security events and sessions</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SecurityStatCard
          title="High Severity Alerts"
          value={securityStats.highAlerts}
          icon={AlertTriangle}
          color="text-red-600"
        />
        <SecurityStatCard
          title="Medium Alerts"
          value={securityStats.mediumAlerts}
          icon={Shield}
          color="text-yellow-600"
        />
        <SecurityStatCard
          title="Low Alerts"
          value={securityStats.lowAlerts}
          icon={CheckCircle2}
          color="text-blue-600"
        />
        <SecurityStatCard
          title="Active Sessions"
          value={securityStats.activeSessions}
          icon={Clock}
          color="text-green-600"
        />
      </div>

      {/* Security Alerts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h3>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showSensitive ? 'Hide' : 'Show'} Sensitive Data</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {securityAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {alert.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {alert.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${alert.severity === 'high' ? 'bg-red-100 text-red-800' : 
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.timestamp.toLocaleString()}
                  </td>
                </tr>
              ))}
              {securityAlerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-2" />
                    <p>No security alerts to display</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}