import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ReviewModal({ open, onClose, onSubmit, loading }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ rating, comment })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            This review will be minted as a soulbound NFT on the freelancer's wallet — permanent and non-transferable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={star <= rating}
                  className="text-2xl transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the work?"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Skip Review
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Minting NFT...' : 'Mint Review NFT'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
