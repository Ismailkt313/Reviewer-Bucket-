export type Reviewer = {
  id: string;
  name: string;
  code: string;
  slug: string;
  stacks: string[];
  stats?: {
    averageRating: number | null;
    ratingCount: number;
    experienceCount: number;
    lastUpdated: string | null;
  };
};
