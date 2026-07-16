import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StoredImage {
  id?: string;
  name: string;
  url?: string;
  key?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly base = `${environment.apiUrl}/admin/images`;
  private readonly s3BaseUrl = 'https://my-store-images-prod.s3.us-east-2.amazonaws.com';

  constructor(private http: HttpClient) {}

  private buildImageUrl(fileName: string): string {
    return `${this.s3BaseUrl}/${encodeURIComponent(fileName)}`;
  }

  private normalizeImage(image: Partial<StoredImage>): StoredImage {
    const name = image.name || image.key || '';
    return {
      ...image,
      name,
      key: image.key || name,
      url: image.url || this.buildImageUrl(name),
    } as StoredImage;
  }

  listImages(): Observable<StoredImage[]> {
    return this.http.get<StoredImage[]>(this.base).pipe(
      map((images) => images.map((image) => this.normalizeImage(image)))
    );
  }

  uploadImages(files: File[]): Observable<StoredImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<StoredImage[]>(`${this.base}/upload`, formData).pipe(
      map((images) => images.map((image) => this.normalizeImage(image)))
    );
  }

  deleteImage(fileName: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(fileName)}`);
  }
}
