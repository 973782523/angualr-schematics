import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

const API_URL = '/api/name-age'

@Injectable({
  providedIn: 'root'
})
// NameAge  NameAge
// nameAge  nameAge
// name-age  name-age
/*
    
          let a=1
      
*
* */
export class NameAgeService {
  constructor(private httpClient: HttpClient) {
  }

  findAll(): Observable<NameAge[]> {
    
    let a=1
      
    return this.httpClient.get<NameAge[]>(API_URL);
  }

  create(nameAge: NameAge): Observable<number> {
    return this.httpClient.post<number>(API_URL, nameAge);
  }

}

export interface NameAge {
  someProperty: string;
}
