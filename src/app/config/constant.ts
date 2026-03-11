import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Constants {
  public readonly API: string = environment.apiUrl;
  reCaptchaSitekey: any;
  googleClientId: any;
}