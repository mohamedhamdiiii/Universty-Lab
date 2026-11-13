import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { Equipment } from '../../models/reservation.model';
import { EquipmentSearchParams, PaginatedResponse } from '../../models/search.model';

@Component({
  selector: 'app-equipment-search',
  templateUrl: './equipment-search.component.html',
  styleUrls: ['./equipment-search.component.css']
})
export class EquipmentSearchComponent implements OnInit {
  equipments: Equipment[] = [];
  pagination = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  currentParams: EquipmentSearchParams = {
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    limit: 10
  };

  loading = false;
  errorMessage = '';

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEquipment();
  }

  onFilterChange(params: EquipmentSearchParams): void {
    this.currentParams = { ...this.currentParams, ...params, page: 1 };
    this.fetchEquipment();
  }

  fetchEquipment(): void {
    this.loading = true;
    this.errorMessage = '';

    this.searchService.searchEquipment(this.currentParams).subscribe({
      next: (response: PaginatedResponse<Equipment>) => {
        this.equipments = response.data;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.errorMessage = 'Failed to load equipment. Please try again.';
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages || page === this.pagination.page) {
      return;
    }
    this.currentParams.page = page;
    this.fetchEquipment();
  }

  bookEquipment(equipment: Equipment): void {
    this.router.navigate(['/booking']);
  }

  get pagesArray(): number[] {
    const total = this.pagination.totalPages;
    const current = this.pagination.page;
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
