export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface CategoryWithCount extends Category {
  _count: { destinations: number };
}

export interface CreateCategoryPayload {
  name: string;
  icon: string | null;
}
