import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

const BASE_API_URL = 'http://localhost:8082';

@Injectable({
  providedIn: 'root',
})
export class ImageService {

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {
  }

  // Метод для получения авторизованного заголовка
  private getAuthorizedHeaders(): Observable<HttpHeaders> {
    return new Observable(observer => {
      this.keycloakService.getToken().then(token => {
        localStorage.setItem('bearerToken', token);
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
        });
        observer.next(headers);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  public getRequest(url: string, options?: any): Observable<any> {
    return new Observable(observer => {
      this.getAuthorizedHeaders().subscribe(
        headers => {
          const mergedOptions = { ...options, headers }; // Убедитесь, что заголовки добавляются корректно
          this.http.get(url, mergedOptions).subscribe(
            data => {
              console.log("Received data from " + url + ":", data); // Логирование полученных данных
              observer.next(data);
              observer.complete();
            },
            error => {
              observer.error(error);
            }
          );
        },
        error => observer.error(error)
      );
    });
  }



  public getImageById(id: string) {
    return this.getRequest(`${BASE_API_URL}/image/${id}`, {headers:{'Accept':'image/jpeg'}, responseType: 'blob'});
  }

  public postImage(url: string, image: Blob | File, options?: any): Observable<Blob> {
    const formData = new FormData();
    formData.append('image', image);

    return new Observable(observer => {
      this.getAuthorizedHeaders().subscribe(
        headers => {
          // Удаляем 'Content-Type' для автоматического установления браузером
          headers = headers.delete('Content-Type');

          // Объединяем пользовательские параметры с заголовками и responseType
          const mergedOptions = { ...options, headers, responseType: 'blob' };

          // Отправляем POST запрос
          this.http.post(url, formData, mergedOptions).subscribe({
            next: (response) => {
              if (response instanceof Blob) {  // Проверка, что ответ действительно Blob
                observer.next(response);
                observer.complete();
              } else {
                observer.error(new Error('Expected a Blob, but received something else.'));
              }
            },
            error: (error) => observer.error(error),
          });
        },
        error => observer.error(error),
      );
    });
  }

  // Добавляем метод для получения списка изображений
  public getImages(): Observable<any> {
    return this.getRequest(`${BASE_API_URL}/user_images`, {responseType: 'json'});
  }

  logout() {
    this.keycloakService.logout();
  }


}
