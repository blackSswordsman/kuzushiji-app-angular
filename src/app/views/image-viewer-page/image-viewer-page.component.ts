import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ImageService } from '../../shared/services/image.service';
import { combineLatest, forkJoin, of, zip } from 'rxjs';



@Component({
  selector: 'app-image-viewer-page',
  templateUrl: './image-viewer-page.component.html',
  styleUrl: './image-viewer-page.component.css',
})
export class ImageViewerPageComponent implements OnInit {
  selectedImageUrl: string | null = null;
  previewSource: string | undefined; // Для превью выбранного изображения
  imageSource: string | undefined;
  selectedFile: File | null = null;
  uploadStatus: string | null = null;
  imageSources: string[] = [];
  currentPage = 0;             // Начальная страница
  pageSize = 5;                // Количество изображений на странице
  uploadProgress = 0;

  constructor(public imageService: ImageService) {
  }

  /* imageSource;*/

  /*ngOnInit(){
    this.imageService.getImageById('2').subscribe(a=>{
      console.log("test",a);
      this.imageSource=URL.createObjectURL(a);
    })
  }*/
  ngOnInit() {
    this.loadImages();
  }

  loadImages(): void {
    this.imageService.getImages().subscribe(images => {
      const requests = images.map(source => {
        return this.imageService.getRequest(source, { headers: { 'Accept': 'image/jpeg' }, responseType: 'blob' });
      });
      forkJoin(requests).subscribe((result: any[]) => {
        result.forEach(el => {
          this.imageSources.push(URL.createObjectURL(el));
        });
      });
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    if (this.selectedFile) {
      this.uploadStatus = `Выбран файл: ${this.selectedFile.name}`;
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewSource = e.target.result;
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.uploadStatus = 'Файл не выбран';
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.uploadStatus = 'Файл не выбран';
      return;
    }

    this.uploadProgress = 0;
    const url = 'http://localhost:8082/process_image';

    // Инициализация таймера
    const totalDuration = 24870;
    const intervalDuration = totalDuration / 100;
    let currentProgress = 0;

    const intervalId = setInterval(() => {
      this.uploadProgress += 1;
      currentProgress += intervalDuration;

      if (this.uploadProgress >= 100) {
        clearInterval(intervalId);
        this.uploadProgress = 100;
      }
    }, intervalDuration);

    this.imageService.postImage(url, this.selectedFile).subscribe({
      next: (blob) => {
        clearInterval(intervalId); // Остановка таймера, если загрузка завершена раньше времени
        this.uploadStatus = 'Изображение успешно загружено';
        this.previewSource = undefined; // Очистить превью
        this.imageSource = URL.createObjectURL(blob);
        console.log('Image uploaded and received successfully');
        this.uploadProgress = 100;
      },
      error: (error) => {
        clearInterval(intervalId); // Остановка таймера при возникновении ошибки
        this.uploadStatus = 'Ошибка при загрузке изображения';
        console.error('Error uploading image:', error);
        this.uploadProgress = 0; // Сброс прогресса
      },
    });
  }
  changePage(step: number): void {
    const newPage = this.currentPage + step;
    if (newPage >= 0 && newPage <= this.imageSources.length / this.pageSize) {
      this.currentPage = newPage;
    }
  }

  openModal(imageUrl: string): void {
    this.selectedImageUrl = imageUrl; // Открыть модальное окно с изображением
  }

  closeModal(): void {
    this.selectedImageUrl = null; // Закрыть модальное окно
  }

  logout():void{
    this.imageService.logout()
  }


}
