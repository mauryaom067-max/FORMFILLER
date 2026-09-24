import { useState } from 'react'
import { Drawer, Badge } from './ui'
import { Icons } from './layout/AppShell'

export function NotificationsBell({ items }) {
  const [open, setOpen] = useState(false)
  const unread = items.filter((n) => n.unread).length

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative text-ink-faint hover:text-ink w-5 h-5">
        {Icons.bell}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white" />
        )}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Notifications" width="max-w-sm">
        {items.length === 0 ? (
          <p className="text-sm text-ink-faint py-8 text-center">You\u2019re all caught up.</p>
        ) : (
          <div className="space-y-1 -mx-2">
            {items.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 px-3 py-3 rounded-lg ${n.unread ? 'bg-brand-50/60' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-brand-500' : 'bg-line'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-ink">{n.text}</p>
                  <p className="text-xs text-ink-faint mt-1">{n.time}</p>
                </div>
                {n.tag && <Badge tone={n.tone || 'gray'}>{n.tag}</Badge>}
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </>
  )
}
