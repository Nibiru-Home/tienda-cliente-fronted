import { Injectable, Inject } from '@angular/core'
import { Observable } from 'rxjs'
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model'
import { User } from '../models/user.model'
import { HTTPService } from './http.service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authRoute: string = '/user'

  constructor(@Inject(HTTPService) private httpService: HTTPService) { }

  register(request: RegisterRequest): Observable<any> {
    return this.httpService.post<any>(`${this.authRoute}/register`, request)
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.httpService.post<AuthResponse>(`${this.authRoute}/login`, request)
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  saveUser(name: string): void {
    localStorage.setItem('auth_name', name)
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  getUserName(): string | null {
    return localStorage.getItem('auth_name')
  }

  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_name')
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  getUsersCount(): Observable<number> {
    return this.httpService.get<number>(`${this.authRoute}/count`)
  }

  getUsers(): Observable<User[]> {
    return this.httpService.getAll<User>(this.authRoute)
  }
}
