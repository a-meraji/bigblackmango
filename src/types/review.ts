export interface ReviewAuthor {
  name: string;
}

export interface ReviewAdminReply {
  message: string;
  createdAt: string;
}

export interface Review {
  id: string;
  author: ReviewAuthor;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  adminReply: ReviewAdminReply | null;
}
