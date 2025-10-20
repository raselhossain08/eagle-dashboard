import { SearchFilters, SearchResultType } from '@/types/search';

export class FilterBuilder {
  private filters: SearchFilters = {};

  addTypeFilter(types: SearchResultType[]): this {
    this.filters.type = types;
    return this;
  }

  addStatusFilter(statuses: string[]): this {
    this.filters.status = statuses;
    return this;
  }

  addRoleFilter(roles: string[]): this {
    this.filters.role = roles;
    return this;
  }

  addDateRange(start: Date, end: Date): this {
    this.filters.dateRange = { start, end };
    return this;
  }

  build(): SearchFilters {
    return { ...this.filters };
  }

  static create(): FilterBuilder {
    return new FilterBuilder();
  }

  static fromExisting(filters: SearchFilters): FilterBuilder {
    const builder = new FilterBuilder();
    builder.filters = { ...filters };
    return builder;
  }
}