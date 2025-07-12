'use client'

import { ReactNode } from 'react'
import { LanguageFilter } from '~/components/language-filter'

interface RepositoryLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export const RepositoryLayout = ({
  children,
  sidebar,
}: RepositoryLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <LanguageFilter />
              {sidebar}
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
