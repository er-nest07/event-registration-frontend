import { useState } from 'react'
import { absoluteUrl } from '../../api/client'
import { MapPinIcon } from '../ui/icons'

export function EventBanner({
  bannerUrl,
  title,
  className = '',
}: {
  bannerUrl: string | null
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = bannerUrl && !failed

  return (
    <div className={`relative aspect-[16/9] w-full overflow-hidden bg-surface-inset ${className}`}>
      {showImage ? (
        <img
          src={absoluteUrl(bannerUrl!)}
          alt={`Banner for ${title}`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-full w-full items-end bg-gradient-to-br from-black via-neutral-800 to-neutral-600 p-4"
          aria-hidden="true"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-white/90">
            <MapPinIcon width={16} height={16} />
            No photo for this event
          </span>
        </div>
      )}
    </div>
  )
}
