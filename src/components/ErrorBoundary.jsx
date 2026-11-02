import { Component } from 'react'
import { Alert, AlertTitle, Button } from '@mui/material'

/** Last-resort catch so a rendering bug shows a message instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Alert
        severity="error"
        sx={{ maxWidth: 480, mx: 'auto', mt: 10 }}
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
      >
        <AlertTitle>Something went wrong</AlertTitle>
        Your saved applications are safe. Try reloading the page.
      </Alert>
    )
  }
}
