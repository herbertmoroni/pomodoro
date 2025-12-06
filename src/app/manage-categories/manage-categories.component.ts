import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategoryService } from '../services/category.service';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { LoggerService } from '../services/logger.service';
import { NotificationService } from '../services/notification.service';
import { CategoryWithMetadata, CategoryDialogData } from '../models';

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
  categories: CategoryWithMetadata[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<ManageCategoriesComponent>,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private notification: NotificationService,
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
      this.notification.error('Failed to load categories');
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
          await this.categoryService.addCategory(result.name, result.color, result.icon, order);
          this.notification.success('Category added');
        } catch (error) {
          this.logger.error('Failed to add category:', error);
          this.notification.error('Failed to add category');
        }
      }
    });
  }

  async onEdit(category: CategoryWithMetadata) {
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
          this.notification.success('Category updated');
        } catch (error) {
          this.logger.error('Failed to update category:', error);
          this.notification.error('Failed to update category');
        }
      }
    });
  }

  async onDelete(category: CategoryWithMetadata) {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await this.categoryService.deleteCategory(category.id);
      this.notification.success('Category deleted');
    } catch (error) {
      this.logger.error('Failed to delete category:', error);
      this.notification.error('Failed to delete category');
    }
  }

  async onDrop(event: CdkDragDrop<CategoryWithMetadata[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);

    // Update order numbers
    const updates = this.categories.map((cat, index) => ({
      id: cat.id,
      order: index,
    }));

    try {
      await this.categoryService.reorderCategories(updates);
      this.notification.success('Order saved');
    } catch (error) {
      this.logger.error('Failed to reorder categories:', error);
      this.notification.error('Failed to save order');
      // Reload to revert visual change
      await this.loadCategories();
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
