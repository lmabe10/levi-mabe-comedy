export type ApiPerformance = {
  date?: string;
  dateLabel?: string;
  doors: string | null;
  showtime: string | null;
  ticketUrl: string | null;
  soldOut: boolean;
};

export type ApiShow = {
  sourceId: number;
  slug: string;
  title: string;
  showUrl: string;
  startDate: string;
  endDate: string;
  multiDay: boolean;
  venue: {
    name: string | null;
    address: string | null;
    cityRegion: string | null;
  };
  ageRestriction: string | null;
  soldOut: boolean;
  specialBanner: string | null;
  performances: ApiPerformance[];
  ticketTiers: Array<{
    label: string | null;
    price: string | null;
  }>;
};

export type ShowsApiResponse = {
  generatedAt: string;
  count: number;
  shows: ApiShow[];
};
