import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category } from '../services/category.service';

export interface CategoryDialogData {
  category?: Category;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.css',
})
export class CategoryDialogComponent implements OnInit {
  name = '';
  color = '#3b82f6';
  icon = 'label';

  // Predefined colors for quick selection
  colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  // Available Material icons
  icons = [
    'label',
    'work',
    'school',
    'home',
    'fitness_center',
    'restaurant',
    'local_cafe',
    'code',
    'brush',
    'music_note',
    'videogame_asset',
    'sports_soccer',
    'book',
    'shopping_cart',
    'favorite',
    'star',
  ];

  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryDialogData
  ) {}

  ngOnInit() {
    if (this.data.mode === 'edit' && this.data.category) {
      this.name = this.data.category.name;
      this.color = this.data.category.color;
      this.icon = this.data.category.icon;
    }
  }

  get title(): string {
    return this.data.mode === 'add' ? 'Add Category' : 'Edit Category';
  }

  get isValid(): boolean {
    return this.name.trim().length > 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.isValid) return;

    this.dialogRef.close({
      name: this.name.trim(),
      color: this.color,
      icon: this.icon,
    });
  }
}
