import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { EquipmentSearchParams } from '../../models/search.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() filterChange = new EventEmitter<EquipmentSearchParams>();

  filterForm!: FormGroup;
  isCollapsed = true; // collapsed by default on mobile
  private destroy$ = new Subject<void>();

  categories = [
    { label: 'Camera', value: 'Camera' },
    { label: '3D Printer', value: '3D Printer' },
    { label: 'Lab Kit', value: 'Lab Kit' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      q: [''],
      categoryCamera: [false],
      category3DPrinter: [false],
      categoryLabKit: [false],
      categoryOther: [false],
      available: ['all'],
      minQuantity: [0],
      sortBy: ['name'],
      sortOrder: ['ASC'],
      limit: [10]
    });

    // Debounce search input separately
    this.filterForm.get('q')!.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.emitFilters());

    // React immediately to other controls
    const controlsToWatch = [
      'categoryCamera', 'category3DPrinter', 'categoryLabKit', 'categoryOther',
      'available', 'minQuantity', 'sortBy', 'sortOrder', 'limit'
    ];

    controlsToWatch.forEach(name => {
      this.filterForm.get(name)!.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.emitFilters());
    });

    // Emit initial filters
    this.emitFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  emitFilters(): void {
    const v = this.filterForm.value;

    // Build selected categories
    const selectedCategories: string[] = [];
    if (v.categoryCamera) selectedCategories.push('camera');
    if (v.category3DPrinter) selectedCategories.push('3d-printer');
    if (v.categoryLabKit) selectedCategories.push('lab-kit');
    if (v.categoryOther) selectedCategories.push('other');

    const params: EquipmentSearchParams = {
      q: v.q || undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      sortBy: v.sortBy,
      sortOrder: v.sortOrder,
      limit: v.limit,
      page: 1
    };

    if (v.available === 'true') {
      params.available = true;
    } else if (v.available === 'false') {
      params.available = false;
    }

    if (v.minQuantity > 0) {
      params.minQuantity = v.minQuantity;
    }

    this.filterChange.emit(params);
  }

  resetFilters(): void {
    this.filterForm.reset({
      q: '',
      categoryCamera: false,
      category3DPrinter: false,
      categoryLabKit: false,
      categoryOther: false,
      available: 'all',
      minQuantity: 0,
      sortBy: 'name',
      sortOrder: 'ASC',
      limit: 10
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSortOrder(): void {
    const current = this.filterForm.get('sortOrder')!.value;
    this.filterForm.get('sortOrder')!.setValue(current === 'ASC' ? 'DESC' : 'ASC');
  }
}
