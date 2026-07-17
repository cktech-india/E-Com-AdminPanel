import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataService } from '../../data.service';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class EcommerceService {

    constructor(
        private http: HttpClient,
        private dataService: DataService,
        private authService: AuthService
    ) {}

    private get baseUrl(): string {
        return this.dataService.apiUrl;
    }

    private get companyCode(): string {
        return this.authService.selectedCompany?.companyCode || 'COMP1';
    }

    // ================= PRODUCTS =================
    getProducts(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'products').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    getActiveProducts(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'products/active-list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    getProduct(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}products/${id}`);
    }
    saveProduct(product: any): Observable<any> {
        product.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'products', product);
    }
    deleteProduct(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}products/${id}`);
    }

    // ================= CATEGORIES =================
    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'categories/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    getActiveCategories(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'categories/active-list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    getCategory(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}categories/${id}`);
    }
    saveCategory(category: any): Observable<any> {
        category.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'categories', category);
    }
    deleteCategory(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}categories/${id}`);
    }

    // ================= ORDERS & ITEMS =================
    getOrders(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'orders/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    getActiveOrders(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'orders/active-list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    getOrder(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}orders/${id}`);
    }
    saveOrder(order: any): Observable<any> {
        order.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'orders', order);
    }
    deleteOrder(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}orders/${id}`);
    }

    getOrderItems(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'order-items/list');
    }
    saveOrderItem(item: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'order-items', item);
    }
    deleteOrderItem(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}order-items/${id}`);
    }

    // ================= BILLING & DETAILS =================
    getBillings(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'billing/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveBilling(billing: any): Observable<any> {
        billing.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'billing', billing);
    }
    deleteBilling(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}billing/${id}`);
    }

    getBillingDetails(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'billing-details/list');
    }
    saveBillingDetail(detail: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'billing-details', detail);
    }
    deleteBillingDetail(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}billing-details/${id}`);
    }

    // ================= INVENTORY =================
    getInventory(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'inventory/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveInventory(inv: any): Observable<any> {
        inv.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'inventory', inv);
    }
    deleteInventory(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}inventory/${id}`);
    }

    // ================= DISCOUNTS =================
    getDiscounts(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'discount/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveDiscount(discount: any): Observable<any> {
        discount.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'discount', discount);
    }
    deleteDiscount(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}discount/${id}`);
    }

    // ================= FAQS =================
    getFaqs(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'faqs/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveFaq(faq: any): Observable<any> {
        faq.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'faqs', faq);
    }
    deleteFaq(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}faqs/${id}`);
    }

    // ================= CONTACT INQUIRIES =================
    getContactInquiries(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'contact-inquiries/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveContactInquiry(inquiry: any): Observable<any> {
        inquiry.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'contact-inquiries', inquiry);
    }
    deleteContactInquiry(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}contact-inquiries/${id}`);
    }

    // ================= BRANCHES =================
    getBranches(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'branches/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveBranch(branch: any): Observable<any> {
        branch.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'branches', branch);
    }
    deleteBranch(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}branches/${id}`);
    }

    // ================= COMPANIES =================
    getCompanies(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'companies/list');
    }
    saveCompany(company: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'companies', company);
    }
    deleteCompany(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}companies/${id}`);
    }

    // ================= TAX CONFIGURATION =================
    getTaxCategories(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'tax-categories/list');
    }
    saveTaxCategory(category: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'tax-categories', category);
    }
    deleteTaxCategory(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}tax-categories/${id}`);
    }

    getTaxRates(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'tax-rates/list');
    }
    saveTaxRate(rate: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'tax-rates', rate);
    }
    deleteTaxRate(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}tax-rates/${id}`);
    }

    getGstHsnCodes(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'gst-hsn-codes/list');
    }
    saveGstHsnCode(code: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'gst-hsn-codes', code);
    }
    deleteGstHsnCode(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}gst-hsn-codes/${id}`);
    }

    getShippingCharges(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'shipping-charges/list');
    }
    saveShippingCharge(charge: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'shipping-charges', charge);
    }
    deleteShippingCharge(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}shipping-charges/${id}`);
    }

    getStates(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'states/list');
    }
    saveState(state: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'states', state);
    }
    deleteState(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}states/${id}`);
    }

    getCountries(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'countries/list');
    }
    saveCountry(country: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'countries', country);
    }
    deleteCountry(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}countries/${id}`);
    }

    getStockLogs(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'stock-log/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveStockLog(log: any): Observable<any> {
        log.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'stock-log', log);
    }
    deleteStockLog(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}stock-log/${id}`);
    }

    getProductGroups(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'product-group');
    }
    saveProductGroup(group: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'product-group', group);
    }
    deleteProductGroup(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}product-group/${id}`);
    }

    getProductTags(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'product-tag').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveProductTag(tag: any): Observable<any> {
        tag.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'product-tag', tag);
    }
    deleteProductTag(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}product-tag/${id}`);
    }

    // ================= PRODUCT REVIEWS =================
    getProductReviews(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'product-review').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveProductReview(review: any): Observable<any> {
        review.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'product-review', review);
    }
    deleteProductReview(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}product-review/${id}`);
    }

    // ================= HOME CONFIGURATION =================
    getHomeConfigs(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'home-config/list');
    }
    saveHomeConfig(config: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'home-config', config);
    }
    deleteHomeConfig(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}home-config/${id}`);
    }

    // ================= CARTS =================
    getCarts(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'carts').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveCart(cart: any): Observable<any> {
        cart.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'carts', cart);
    }
    deleteCart(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}carts/${id}`);
    }

    // ================= WISHLISTS =================
    getWishlists(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'wishlist').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveWishlist(wishlist: any): Observable<any> {
        wishlist.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'wishlist', wishlist);
    }
    deleteWishlist(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}wishlist/${id}`);
    }

    // ================= SEO METADATA =================
    getSeoMetadata(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'seo-metadata/list').pipe(
            map(list => (list || []).filter(item => item.companyCode === this.companyCode))
        );
    }
    saveSeoMetadata(seo: any): Observable<any> {
        seo.companyCode = this.companyCode;
        return this.http.post<any>(this.baseUrl + 'seo-metadata', seo);
    }
    deleteSeoMetadata(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}seo-metadata/${id}`);
    }
}

