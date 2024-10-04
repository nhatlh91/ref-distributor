import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {

  constructor(private httpClient: HttpClient) {
  }

  healthCheck(): Observable<any> {
    return this.httpClient.get(`${environment.host}/actuator/health`);
  }
}
