/** Public review on food detail (GET /foods/:id, GET /foods/:id/reviews) */
export interface PublicAdminReply {
  message: string;
  repliedAt: string;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  adminReply: PublicAdminReply | null;
  createdAt: string;
}

/** @deprecated Use PublicReview for customer UI */
export type Review = PublicReview;
