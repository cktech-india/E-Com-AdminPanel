import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

interface MediaItem {
    id: number;
    productId: number;
    mediaType: string;
    mediaUrl: string;
}

@Component({
    selector: 'app-product-media',
    templateUrl: './product-media.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatCard, MatCardContent,
        MatIconModule, MatTabsModule, MatTooltipModule
    ]
})
export class ProductMediaComponent implements OnInit {

    activeTab: number = 0;
    viewMode: 'grid' | 'list' = 'grid';

    // Products Data
    products: any[] = [];
    selectedProduct: any = null;
    productMediaList: MediaItem[] = [];

    // Categories Data
    categories: any[] = [];
    selectedCategory: any = null;

    constructor(
        private _service: EcommerceService,
        private _http: HttpClient,
        private _ui: UiService,
        private _clipboard: Clipboard
    ) {}

    ngOnInit(): void {
        this.loadProducts();
        this.loadCategories();
    }

    loadProducts() {
        this._service.getProducts().subscribe({
            next: (res) => {
                this.products = res || [];
                if (this.selectedProduct) {
                    // Refresh selected product state
                    this.selectedProduct = this.products.find(p => p.id === this.selectedProduct.id);
                }
            }
        });
    }

    loadCategories() {
        this._service.getCategories().subscribe({
            next: (res) => {
                this.categories = res || [];
                if (this.selectedCategory) {
                    // Refresh selected category state
                    this.selectedCategory = this.categories.find(c => c.id === this.selectedCategory.id);
                }
            }
        });
    }

    onTabChanged(index: number) {
        this.activeTab = index;
        this.selectedProduct = null;
        this.selectedCategory = null;
        this.productMediaList = [];
    }

    // ================= PRODUCT GALLERY =================

    selectProduct(product: any) {
        this.selectedProduct = product;
        this.loadProductMedia();
    }

    loadProductMedia() {
        this.productMediaList = [];
        this._http.get<MediaItem[]>(sessionStorage.getItem('apiUrl') + 'product-media/active-list', this._ui.httpOptions)
            .subscribe({
                next: (res) => {
                    this.productMediaList = (res || []).filter(item => item.productId === this.selectedProduct.id);
                }
            });
    }

    uploadProductFiles(event: any) {
        if (!this.selectedProduct) return;

        const files = event.target.files;
        if (!files || files.length === 0) return;

        const uploadPromises = Array.from(files).map((file: any) => {
            return new Promise<void>((resolve, reject) => {
                const folderPath = `product/${this.selectedProduct.id}`;
                const apiUrl = sessionStorage.getItem('apiUrl');

                // 1. Get presigned/temp upload URL from backend S3/local config
                this._http.get<any>(`${apiUrl}file/presigned-url?filePath=${folderPath}&fileName=${file.name}`, this._ui.httpOptions)
                    .subscribe({
                        next: (urlRes) => {
                            const uploadUrl = urlRes.uploadUrl;
                            const fileUrl = urlRes.fileUrl;

                            // 2. Perform PUT/POST to upload the file binary payload
                            // If uploadUrl contains upload-local, we do request, else standard S3 PUT
                            const isLocal = uploadUrl.includes('upload-local');
                            const req = isLocal 
                                ? this._http.put(uploadUrl, file) 
                                : this._http.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

                            req.subscribe({
                                next: () => {
                                    // 3. Save reference url to product_media_t table
                                    const mediaRecord = {
                                        productId: this.selectedProduct.id,
                                        mediaType: 'IMG',
                                        mediaUrl: fileUrl
                                    };
                                    this._http.post(apiUrl + 'product-media', mediaRecord, this._ui.httpOptions)
                                        .subscribe({
                                            next: () => resolve(),
                                            error: (e) => reject(e)
                                        });
                                },
                                error: (e) => reject(e)
                            });
                        },
                        error: (e) => reject(e)
                    });
            });
        });

        Promise.all(uploadPromises).then(() => {
            this._ui.showToastr('', 'Product gallery files uploaded successfully', 'success', 2000);
            this.loadProductMedia();
        }).catch((err) => {
            this._ui.errorAlert('Failed to upload one or more files');
            console.error(err);
            this.loadProductMedia();
        });
    }

    deleteProductFile(item: MediaItem) {
        if (!confirm('Are you sure you want to delete this image?')) return;

        // 1. Delete DB record
        this._http.delete(`${sessionStorage.getItem('apiUrl')}product-media/${item.id}`, this._ui.httpOptions)
            .subscribe({
                next: () => {
                    // 2. Delete file from S3 / local storage
                    const filePath = this.getFilePathFromUrl(item.mediaUrl);
                    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
                    const folderPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);

                    this._http.delete(`${sessionStorage.getItem('apiUrl')}file/delete?fileName=${btoa(fileName)}&filePath=${btoa(folderPath)}`, this._ui.httpOptions)
                        .subscribe({
                            next: () => {
                                this._ui.showToastr('', 'File deleted successfully', 'success', 1500);
                                this.loadProductMedia();
                            },
                            error: () => {
                                // DB deleted but file failed, refresh list anyway
                                this.loadProductMedia();
                            }
                        });
                }
            });
    }

    // Default Product Image operations

    uploadDefaultProductImage(event: any) {
        if (!this.selectedProduct) return;
        const file = event.target.files[0];
        if (!file) return;

        const folderPath = `product/${this.selectedProduct.id}`;
        const apiUrl = sessionStorage.getItem('apiUrl');

        this._http.get<any>(`${apiUrl}file/presigned-url?filePath=${folderPath}&fileName=${file.name}`, this._ui.httpOptions)
            .subscribe({
                next: (urlRes) => {
                    const uploadUrl = urlRes.uploadUrl;
                    const fileUrl = urlRes.fileUrl;

                    const req = uploadUrl.includes('upload-local')
                        ? this._http.put(uploadUrl, file)
                        : this._http.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

                    req.subscribe({
                        next: () => {
                            // Update products_t image_url column
                            const updatedProduct = {
                                ...this.selectedProduct,
                                imageUrl: fileUrl
                            };
                            this._service.saveProduct(updatedProduct).subscribe({
                                next: () => {
                                    this._ui.showToastr('', 'Product cover image updated', 'success', 1500);
                                    this.loadProducts();
                                }
                            });
                        }
                    });
                }
            });
    }

    setDefaultFromGallery(item: MediaItem) {
        const updatedProduct = {
            ...this.selectedProduct,
            imageUrl: item.mediaUrl
        };
        this._service.saveProduct(updatedProduct).subscribe({
            next: () => {
                this._ui.showToastr('', 'Product cover image set', 'success', 1500);
                this.loadProducts();
            }
        });
    }

    deleteDefaultProductImage() {
        if (!confirm('Are you sure you want to delete the product default cover?')) return;

        const oldUrl = this.selectedProduct.imageUrl;
        const updatedProduct = {
            ...this.selectedProduct,
            imageUrl: null
        };

        this._service.saveProduct(updatedProduct).subscribe({
            next: () => {
                this._ui.showToastr('', 'Cover image cleared', 'success', 1500);
                this.loadProducts();

                // Optionally delete physical file
                if (oldUrl) {
                    const filePath = this.getFilePathFromUrl(oldUrl);
                    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
                    const folderPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);
                    this._http.delete(`${sessionStorage.getItem('apiUrl')}file/delete?fileName=${btoa(fileName)}&filePath=${btoa(folderPath)}`, this._ui.httpOptions).subscribe();
                }
            }
        });
    }

    // ================= CATEGORY COVER =================

    selectCategory(category: any) {
        this.selectedCategory = category;
    }

    uploadCategoryFile(event: any) {
        if (!this.selectedCategory) return;
        const file = event.target.files[0];
        if (!file) return;

        const folderPath = `category/${this.selectedCategory.categoryId}`;
        const apiUrl = sessionStorage.getItem('apiUrl');

        this._http.get<any>(`${apiUrl}file/presigned-url?filePath=${folderPath}&fileName=${file.name}`, this._ui.httpOptions)
            .subscribe({
                next: (urlRes) => {
                    const uploadUrl = urlRes.uploadUrl;
                    const fileUrl = urlRes.fileUrl;

                    const req = uploadUrl.includes('upload-local')
                        ? this._http.put(uploadUrl, file)
                        : this._http.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

                    req.subscribe({
                        next: () => {
                            // Update category_t image_url column
                            const updatedCategory = {
                                ...this.selectedCategory,
                                imageUrl: fileUrl
                            };
                            this._service.saveCategory(updatedCategory).subscribe({
                                next: () => {
                                    this._ui.showToastr('', 'Category image updated', 'success', 1500);
                                    this.loadCategories();
                                }
                            });
                        }
                    });
                }
            });
    }

    deleteCategoryFile() {
        if (!confirm('Are you sure you want to delete this category image?')) return;

        const oldUrl = this.selectedCategory.imageUrl;
        const updatedCategory = {
            ...this.selectedCategory,
            imageUrl: null
        };

        this._service.saveCategory(updatedCategory).subscribe({
            next: () => {
                this._ui.showToastr('', 'Category image cleared', 'success', 1500);
                this.loadCategories();

                // Optionally delete physical file
                if (oldUrl) {
                    const filePath = this.getFilePathFromUrl(oldUrl);
                    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
                    const folderPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);
                    this._http.delete(`${sessionStorage.getItem('apiUrl')}file/delete?fileName=${btoa(fileName)}&filePath=${btoa(folderPath)}`, this._ui.httpOptions).subscribe();
                }
            }
        });
    }

    // ================= HELPERS =================

    getFilePathFromUrl(url: string): string {
        if (!url) return '';
        if (url.includes('filePath=')) {
            const parts = url.split('filePath=');
            return decodeURIComponent(parts[1]);
        }
        try {
            const urlObj = new URL(url);
            return decodeURIComponent(urlObj.pathname.substring(1)); // remove leading '/'
        } catch (e) {
            return url;
        }
    }

    copyToClipboard(item: any) {
        const url = typeof item === 'string' ? item : item.mediaUrl;
        this._clipboard.copy(url);
        this._ui.showToastr('', 'Media URL copied to clipboard', 'info', 1500);
    }
}
