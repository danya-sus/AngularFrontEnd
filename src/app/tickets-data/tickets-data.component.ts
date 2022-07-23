import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-tickets-data',
  templateUrl: './tickets-data.component.html',
})

export class TicketsDataComponent {
  public tickets: Ticket[] = [];
  public airlines: Airline[] = [];
  public dNumber: string = "";
  public tNumber: string = "";
  public airline: string = "";
  public isChecked: boolean;
  public errorMessage: string = "";
  public loading: boolean;
  public tempDNumber: string = '';
  public tempTNumber: string = '';
  public tempIsChecked: boolean = true;

  constructor(private httpClient: HttpClient) {
    this.isChecked = true;
    this.loading = false;
  };

  public getAirlines(){
    this.errorMessage = "";
    this.httpClient.get<Airline[]>('http://localhost:5000/api/v1/transactions/airlines').subscribe(result => {
      this.airlines = result;
      this.errorMessage = "";
    }, error => {
      if (error.status != 0){
        this.errorMessage = error.error;
      }
      else this.errorMessage = "Сервер недоступен, попробуйте сделать запрос позднее...";
    });
  }

  public getByDocNumber() {
    this.tempDNumber = this.dNumber;
    this.tempTNumber = '';
    this.errorMessage = "";
    this.loading = true;
    this.tickets = [];
    this.httpClient.post<Ticket[]>('http://localhost:5000/api/v1/transactions/by_doc_number', {
      docNumber: this.dNumber
    }, {headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }).subscribe(result => {
      this.tickets = result;
      this.errorMessage = "";
      this.loading = false;
      if (this.airlines = []) {
        this.getAirlines();
      }
    }, error => {
      if (error.status != 0){
        this.errorMessage = error.error;
      }
      else this.errorMessage = "Сервер недоступен, попробуйте сделать запрос позднее...";
      this.loading = false;
    });
  }

  public getByTicketNumber() {
    this.tempDNumber = '';
    this.tempTNumber = this.tNumber;
    this.tempIsChecked = this.isChecked;
    this.errorMessage = "";
    this.loading = true;
    this.tickets = [];
    this.httpClient.post<Ticket[]>('http://localhost:5000/api/v1/transactions/by_ticket_number', {
      ticketNumber: this.tNumber,
      isChecked: !this.isChecked
    }, {headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }).subscribe(result => {
      this.tickets = result;
      this.errorMessage = "";
      this.loading = false;
      if (this.airlines = []) {
        this.getAirlines();
      }
    }, error => {
      if (error.status != 0){
        this.errorMessage = error.error;
      }
      else this.errorMessage = "Сервер недоступен, попробуйте сделать запрос позднее...";
      this.loading = false;
    });
  }

  public clearDocNum() {
    this.dNumber = "";
  }

  public clearTicketNum() {
    this.tNumber = "";
  }

  public toFile() {

    console.log(this.tempDNumber);

    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    } = {
      responseType: 'arraybuffer'
    };

    var iataCode = this.airline.trim().slice(this.airline.length - 3, this.airline.length - 1);

    if (this.tempDNumber != '') {
      this.httpClient.post('http://localhost:5000/api/v1/transactions/get_doc_file', {
        docNumber: this.tempDNumber,
        airlineCode: iataCode
      }, options)
      .subscribe(data => {
        const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const fileName = iataCode + '_AirlineReport.xlsx';
        //window.open(window.URL.createObjectURL(blob));
        FileSaver.saveAs(blob, fileName);
      });
    }
    else {
      this.httpClient.post('http://localhost:5000/api/v1/transactions/get_ticket_file', {
        ticketNumber: this.tempTNumber,
        isChecked: !this.isChecked,
        airlineCode: iataCode
      }, options)
      .subscribe(data => {
        const blob = new Blob([data], {type: 'text/csv'});
        const fileName = iataCode + '_AirlineReport.csv';
        FileSaver.saveAs(blob, fileName);
      })
    }
  }
}

interface Ticket {
  operationId: bigint;
  type: string;
  time: any;
  place: string;
  sender: string;
  transactionTime: string;
  validationStatus: string;
  passengerId: bigint;
  surname: string;
  name: string;
  patronymic: string;
  birthdate: any;
  genderId: number;
  passengerDocumentId: bigint;
  passengerDocumentType: string;
  passengerDocumentNumber: string;
  passengerDocumentDisabledNumber: string;
  passengerDocumentLargeNumber: string;
  passengerTypeId: number;
  passengerTypeName: string;
  passengerTypeType: string;
  raCategory: string;
  description: string;
  isQuota: boolean;
  ticketId: bigint;
  ticketNumber: string;
  ticketType: number;
  airlineRouteId: bigint;
  airlineCode: string;
  departPlace: string;
  departDatetime: any;
  arrivePlace: string;
  arriveDatetime: any;
  pnrID: string;
  operatingAirlineCode: string;
  cityFromCode: string;
  cityFromName: string;
  airportFromIcaoCode: string;
  airportFromRfCode: string;
  airportFromName: string;
  cityToCode: string;
  cityToName: string;
  airportToIcaoCode: string;
  airportToRfCode: string;
  airportToName: string;
  flightNums: string;
  fareCode: string;
  farePrice: number;
}

interface Airline {
  id: number;
  name: string;
  nameEn: string;
  icaoCode: string;
  iataCode: string;
  rfCode: string;
  country: string;
}
