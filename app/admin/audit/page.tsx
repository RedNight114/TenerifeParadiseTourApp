"use client"

import React from "react"
import { AdminLayoutModern } from "@/components/admin/admin-layout-modern"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { AuditDashboardSimple } from "@/components/admin/audit-dashboard-simple"

export default function AdminAudit() {
  return (
    <AdminGuard>
      <AdminLayoutModern>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
              <AdminBreadcrumbs 
                customItems={[
                  { label: 'Admin', href: '/admin/dashboard' },
                  { label: 'Auditoría' }
                ]}
                className="mt-2"
              />
            </div>
          </div>

          <AuditDashboardSimple />
        </div>
      </AdminLayoutModern>
    </AdminGuard>
  )
}
