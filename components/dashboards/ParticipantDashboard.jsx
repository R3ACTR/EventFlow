'use client';

import React from 'react';
import CopyButton from "@/components/CopyButton";


/**
 * Participant Dashboard Component
 * TODO: Being implemented by Person 2
 * @param {import('./types').DashboardProps} props
 */
export default function ParticipantDashboard({ userId, role }) {
  return (
    <div className="participant-dashboard">
      <h1>Participant Dashboard</h1>
      <p>Implementation in progress by Person 2...</p>
    </div>
    
    <div className="flex items-center gap-2">
  <span>{dashboardData.certificateId}</span>
  <CopyButton text={dashboardData.certificateId} />
</div>

  <div className="flex items-center gap-2">
  <a href={dashboardData.githubRepo} target="_blank">
    {dashboardData.githubRepo}
  </a>
  <CopyButton text={dashboardData.githubRepo} />
</div>

  <div className="flex items-center gap-2">
  <span>{dashboardData.inviteCode}</span>
  <CopyButton text={dashboardData.inviteCode} />
</div>



  );
}
