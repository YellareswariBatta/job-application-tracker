import { Icon } from '@iconify/react'
// Icon data is bundled (no network calls), one import per icon so unused icons are tree-shaken.
import bookmarkPlus from '@iconify-icons/lucide/bookmark-plus'
import calendarPlus from '@iconify-icons/lucide/calendar-plus'
import chevronDown from '@iconify-icons/lucide/chevron-down'
import clipboardPaste from '@iconify-icons/lucide/clipboard-paste'
import spreadsheet from '@iconify-icons/lucide/file-spreadsheet'
import history from '@iconify-icons/lucide/history'
import hourglass from '@iconify-icons/lucide/hourglass'
import scale from '@iconify-icons/lucide/scale'
import undo from '@iconify-icons/lucide/undo-2'
import arrowLeft from '@iconify-icons/lucide/arrow-left'
import arrowRight from '@iconify-icons/lucide/arrow-right'
import banknote from '@iconify-icons/lucide/banknote'
import barChart from '@iconify-icons/lucide/chart-column'
import bellRing from '@iconify-icons/lucide/bell-ring'
import briefcase from '@iconify-icons/lucide/briefcase-business'
import calendar from '@iconify-icons/lucide/calendar-days'
import calendarCheck from '@iconify-icons/lucide/calendar-check'
import chartPie from '@iconify-icons/lucide/chart-pie'
import check from '@iconify-icons/lucide/check'
import circleX from '@iconify-icons/lucide/circle-x'
import clock from '@iconify-icons/lucide/clock'
import download from '@iconify-icons/lucide/download'
import externalLink from '@iconify-icons/lucide/external-link'
import eye from '@iconify-icons/lucide/eye'
import eyeOff from '@iconify-icons/lucide/eye-off'
import fileJson from '@iconify-icons/lucide/file-json'
import filterX from '@iconify-icons/lucide/filter-x'
import gripVertical from '@iconify-icons/lucide/grip-vertical'
import house from '@iconify-icons/lucide/house'
import inbox from '@iconify-icons/lucide/inbox'
import kanban from '@iconify-icons/lucide/kanban'
import lock from '@iconify-icons/lucide/lock'
import logIn from '@iconify-icons/lucide/log-in'
import logOut from '@iconify-icons/lucide/log-out'
import mail from '@iconify-icons/lucide/mail'
import messages from '@iconify-icons/lucide/messages-square'
import minus from '@iconify-icons/lucide/minus'
import moon from '@iconify-icons/lucide/moon'
import notebook from '@iconify-icons/lucide/notebook-pen'
import palette from '@iconify-icons/lucide/palette'
import partyPopper from '@iconify-icons/lucide/party-popper'
import pencil from '@iconify-icons/lucide/pencil'
import plus from '@iconify-icons/lucide/plus'
import rocket from '@iconify-icons/lucide/rocket'
import search from '@iconify-icons/lucide/search'
import send from '@iconify-icons/lucide/send'
import shieldCheck from '@iconify-icons/lucide/shield-check'
import sparkles from '@iconify-icons/lucide/sparkles'
import sun from '@iconify-icons/lucide/sun'
import target from '@iconify-icons/lucide/target'
import trash from '@iconify-icons/lucide/trash-2'
import trendingUp from '@iconify-icons/lucide/trending-up'
import trophy from '@iconify-icons/lucide/trophy'
import upload from '@iconify-icons/lucide/upload'
import user from '@iconify-icons/lucide/user'
import userPlus from '@iconify-icons/lucide/user-plus'
import x from '@iconify-icons/lucide/x'
import zap from '@iconify-icons/lucide/zap'

const ICONS = {
  bookmarkPlus, calendarPlus, chevronDown, clipboardPaste, spreadsheet, history, hourglass, scale, undo,
  arrowLeft, arrowRight, banknote, barChart, bellRing, briefcase, calendar, calendarCheck, chartPie, check,
  circleX, clock, download, externalLink, eye, eyeOff, fileJson, filterX, gripVertical, house, inbox, kanban, lock,
  logIn, logOut, mail, messages, minus, moon, notebook, palette, partyPopper, pencil, plus, rocket, search,
  send, shieldCheck, sparkles, sun, target, trash, trendingUp, trophy, upload, user, userPlus, x, zap,
}

// One icon per board status.
export const STATUS_ICONS = { Applied: 'send', Interviewing: 'messages', Offer: 'partyPopper', Rejected: 'circleX' }

export default function AppIcon({ name, size = 20, ...rest }) {
  return <Icon icon={ICONS[name]} width={size} height={size} aria-hidden="true" {...rest} />
}
