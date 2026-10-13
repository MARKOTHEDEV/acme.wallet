import { Suspense } from 'react'
import { DashboardPage, DashboardSkeleton } from '@/components/dashboard'

/**
 * The dashboard reads the open transaction from the URL on the client, which needs a Suspense
 * boundary for the static prerender; the skeleton is the fallback.
 */
export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  )
}
