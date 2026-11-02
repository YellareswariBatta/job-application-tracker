import { useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import AppIcon from '../../components/AppIcon'

/**
 * A drag-to-bookmarks-bar link. Clicking it on any job page opens the Add form here, pre-filled with
 * the page title and link. It only reads the page's title and address; nothing else leaves that page.
 * The href is set after render because React refuses to render `javascript:` URLs itself.
 */
export default function Bookmarklet() {
  const ref = useRef(null)

  useEffect(() => {
    const target = `${window.location.origin}${import.meta.env.BASE_URL}board`
    const code = `(function(){window.open('${target}?add=1&role='+encodeURIComponent(document.title)+'&link='+encodeURIComponent(location.href),'_blank')})()`
    ref.current.setAttribute('href', `javascript:${code}`)
  }, [])

  return (
    <Box sx={{ p: 2, borderRadius: 3, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box
        component="a"
        ref={ref}
        href="#"
        draggable
        onClick={(e) => e.preventDefault()} // clicking here would do nothing useful; it is meant to be dragged
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 0.75, borderRadius: 99, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', cursor: 'grab', backgroundImage: (t) => t.custom.gradient }}
      >
        <AppIcon name="bookmarkPlus" size={16} /> Save to Job Tracker
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>
        Quick add: drag this button to your bookmarks bar. On any job page, click it to add that job here.
      </Typography>
    </Box>
  )
}
