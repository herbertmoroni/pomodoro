import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategoryService, Category } from '../services/category.service';
import { CategoryDialogComponent, CategoryDialogData } from '../category-dialog/category-dialog.component';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    DragDropModule,
  ],
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.css',
})
export class ManageCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<ManageCategoriesComponent>,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading = true;
    try {
      this.categoryService.getUserCategories().subscribe((categories) => {
        this.categories = categories;
        this.loading = false;
      });
    } catch (error) {
      this.logger.error('Failed to load categories:', error);
      this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      this.loading = false;
    }
  }

  async onAdd() {
    const dialogRef = this.dialog.open<CategoryDialogComponent, CategoryDialogData>(
      CategoryDialogComponent,
      {
        width: '500px',
        data: { mode: 'add' },
      }
    );

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const order = await this.categoryService.getNextOrderNumber();
          await this.categoryService.addCategory(
            result.name,
            result.color,
            result.icon,
            order
          );
          this.snackBar.open('Category added', 'Close', { duration: 2000 });
        } catch (error) {
          this.logger.error('Failed to add category:', error);
          this.snackBar.open('Failed to add category', 'Close', { duration: 3000 });
        }
      }
    });
  }

  async onEdit(category: Category) {
    const dialogRef = this.dialog.open<CategoryDialogComponent, CategoryDialogData>(
      CategoryDialogComponent,
      {
        width: '500px',
        data: { mode: 'edit', category },
      }
    );

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.categoryService.updateCategory(category.id, result);
          this.snackBar.open('Category updated', 'Close', { duration: 2000 });
        } catch (error) {
          this.logger.error('Failed to update category:', error);
          this.snackBar.open('Failed to update category', 'Close', { duration: 3000 });
        }
      }
    });
  }

  async onDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await this.categoryService.deleteCategory(category.id);
      this.snackBar.open('Category deleted', 'Close', { duration: 2000 });
    } catch (error) {
      this.logger.error('Failed to delete category:', error);
      this.snackBar.open('Failed to delete category', 'Close', { duration: 3000 });
    }
  }

  async onDrop(event: CdkDragDrop<Category[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);

    // Update order numbers
    const updates = this.categories.map((cat, index) => ({
      id: cat.id,
      order: index,
    }));

    try {
      await this.categoryService.reorderCategories(updates);
      this.snackBar.open('Order saved', 'Close', { duration: 2000 });
    } catch (error) {
      this.logger.error('Failed to reorder categories:', error);
      this.snackBar.open('Failed to save order', 'Close', { duration: 3000 });
      // Reload to revert visual change
      await this.loadCategories();
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
