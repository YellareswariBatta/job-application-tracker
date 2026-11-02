import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { useAuth } from '../AuthContext'

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

/** Avatar button in the header that opens account details and the log-out action. */
export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState(null)

  function handleLogout() {
    setAnchor(null)
    // Navigate first: if the user is cleared first, the route guard would redirect to /login instead of home.
    navigate('/', { replace: true })
    logout()
  }

  return (
    <>
      <Tooltip title="Account">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Account menu" sx={{ p: 0.5 }}>
          <Avatar sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700, bgcolor: 'rgba(255,255,255,.28)', border: '2px solid rgba(255,255,255,.7)', color: '#fff' }}>
            {initialsOf(user.name)}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
          <Typography fontWeight={700} noWrap>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <AppIcon name="logOut" size={18} />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  )
}
