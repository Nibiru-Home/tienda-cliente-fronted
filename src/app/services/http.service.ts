import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HTTPService {
    private readonly baseUrl = 'http://back-nibiru-home.producciondaw.cip.fpmislata.com';

    constructor(private http: HttpClient) { }

    get<T>(url: string): Observable<T> {
        return this.http.get<T>(this.getFullUrl(url));
    }

    getAll<T>(url: string): Observable<T[]> {
        return this.http.get<T[]>(this.getFullUrl(url));
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.http.post<T>(this.getFullUrl(url), body);
    }

    postText(url: string, body: any): Observable<string> {
        return this.http.post(this.getFullUrl(url), body, { responseType: 'text' });
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.http.put<T>(this.getFullUrl(url), body);
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(this.getFullUrl(url));
    }

    private getFullUrl(url: string): string {
        if (url.startsWith('http')) {
            return url;
        }
        if (!url.startsWith('/')) {
            return `${this.baseUrl}/${url}`;
        }
        return `${this.baseUrl}${url}`;
    }
}
