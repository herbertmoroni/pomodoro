import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Observable, switchMap, of } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  order: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private firestore: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
  }

  /**
   * Get all categories for the current user
   */
  getUserCategories(): Observable<Category[]> {
    return this.firebaseService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }
        return this.fetchUserCategories(user.uid);
      })
    );
  }

  private async fetchUserCategories(userId: string): Promise<Category[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    const q = query(
      categoriesRef,
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];

    querySnapshot.forEach((docSnapshot) => {
      categories.push({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Category, 'id'>),
      });
    });

    return categories;
  }

  /**
   * Add a new category
   */
  async addCategory(
    name: string,
    color: string,
    icon: string,
    order: number
  ): Promise<string> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      throw new Error('User must be signed in to add categories');
    }

    const categoriesRef = collection(this.firestore, 'categories');
    const newCategory = {
      name,
      color,
      icon,
      userId: user.uid,
      order,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(categoriesRef, newCategory);
    return docRef.id;
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', categoryId);
    await updateDoc(categoryRef, updates);
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', categoryId);
    await deleteDoc(categoryRef);
  }

  /**
   * Reorder categories (batch update)
   */
  async reorderCategories(categories: { id: string; order: number }[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    categories.forEach(({ id, order }) => {
      const categoryRef = doc(this.firestore, 'categories', id);
      batch.update(categoryRef, { order });
    });

    await batch.commit();
  }

  /**
   * Get the next order number for a new category
   */
  async getNextOrderNumber(): Promise<number> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) return 0;

    const categories = await this.fetchUserCategories(user.uid);
    if (categories.length === 0) return 0;

    return Math.max(...categories.map((c) => c.order)) + 1;
  }

  /**
   * Initialize default categories for a new user
   */
  async initializeDefaultCategories(): Promise<void> {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      throw new Error('User must be signed in to initialize categories');
    }

    const defaultCategories = [
      { name: 'Work', color: '#22c55e', icon: 'label', order: 0 },
      { name: 'Study', color: '#3b82f6', icon: 'label', order: 1 },
      { name: 'Personal', color: '#a855f7', icon: 'label', order: 2 },
      { name: 'Urgent', color: '#ef4444', icon: 'label', order: 3 },
      { name: 'Exercise', color: '#eab308', icon: 'label', order: 4 },
    ];

    // Add all default categories
    const promises = defaultCategories.map((cat) =>
      this.addCategory(cat.name, cat.color, cat.icon, cat.order)
    );

    await Promise.all(promises);
  }
}
