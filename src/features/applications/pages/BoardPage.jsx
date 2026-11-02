import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, Collapse } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { useApplications } from '../ApplicationsContext'
import { EMPTY_FILTERS, filterApplications, hasActiveFilters } from '../filters'
import Board from '../components/Board'
import FilterBar from '../components/FilterBar'
import HeroBanner from '../components/HeroBanner'
import ApplicationForm from '../components/ApplicationForm'
import Modal from '../../../components/Modal'
import JobAdvertDialog from '../../jobhelper/JobAdvertDialog'
import { guessSource } from '../../jobhelper/jobAdvert'

const clip = (value) => (value ?? '').trim().slice(0, 100)

export default function BoardPage() {
  usePageTitle('Board')
  const { applications, addApplication } = useApplications()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [adding, setAdding] = useState(null) // null = closed; otherwise an object of values to pre-fill ({} for none)
  const [pasting, setPasting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // The "Save to Job Tracker" bookmarklet opens /board?add=1&role=…&link=… to start a pre-filled form.
  useEffect(() => {
    if (searchParams.get('add') !== '1') return
    const link = searchParams.get('link') ?? ''
    const safeLink = /^https?:\/\//i.test(link) ? link : ''
    setAdding({ role: clip(searchParams.get('role')), company: clip(searchParams.get('company')), jobLink: safeLink, source: guessSource(safeLink) })
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const visible = useMemo(() => filterApplications(applications, filters), [applications, filters])
  const isFiltered = hasActiveFilters(filters)

  return (
    <>
      <HeroBanner applications={applications} onAdd={() => setAdding({})} onPasteAdvert={() => setPasting(true)} />

      <FilterBar filters={filters} onChange={setFilters} />

      <Collapse in={applications.length === 0}>
        <Alert icon={<AppIcon name="sparkles" size={20} />} severity="info" sx={{ mb: 2 }}>
          Welcome! Add your first application to get started. Everything is saved in this browser only. Tip: drag cards between columns to update their status.
        </Alert>
      </Collapse>

      <Board visible={visible} isFiltered={isFiltered} />

      {adding && (
        <Modal title="Add application" onClose={() => setAdding(null)}>
          <ApplicationForm
            prefill={adding}
            onCancel={() => setAdding(null)}
            onSubmit={(data) => {
              addApplication(data)
              setAdding(null)
            }}
          />
        </Modal>
      )}

      {pasting && (
        <JobAdvertDialog
          onClose={() => setPasting(false)}
          onCreate={(prefill) => {
            setPasting(false)
            setAdding(prefill)
          }}
        />
      )}
    </>
  )
}
