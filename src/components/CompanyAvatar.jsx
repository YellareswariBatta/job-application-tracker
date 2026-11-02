import { Avatar } from '@mui/material'

const COLOURS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

// Same company name always gets the same colour.
const colourFor = (name) => COLOURS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLOURS.length]

/** Coloured circle with the company's first letter. */
export default function CompanyAvatar({ name, size = 36 }) {
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: colourFor(name), fontSize: size * 0.45, fontWeight: 700 }}>
      {name.trim().charAt(0).toUpperCase()}
    </Avatar>
  )
}
