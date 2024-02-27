import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isEmpty } from 'lodash';

@Injectable()
export class CustomHttpService {
  constructor(private httpService: HttpService) {}

  post(route, body, config?) {
    return firstValueFrom(
      this.httpService.post(route, body, config).pipe(
        map((response) => {
          return response && response?.data ? response?.data : response;
        }),
      ),
    ).catch(function (error) {
      const response = error?.response;
      console.log(error);

      if (response) {
        throw new HttpException(response.data, response.status);
      }
      if (error && !isEmpty(error)) {
        throw new HttpException(
          error,
          error.status || HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        error,
        error.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  }

  get(route, config?) {
    return firstValueFrom(
      this.httpService.get(route, config).pipe(
        map((response) => {
          return response?.data;
        }),
      ),
    ).catch(function (error) {
      console.log(error);

      const response = error?.response;
      if (response) {
        throw new HttpException(response.data, response.status);
      }
      if (error && !isEmpty(error)) {
        throw new HttpException(
          error,
          error.status || HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        error,
        error.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  }

  get axios(): any {
    return this.httpService.axiosRef;
  }

  async postToGateway(route, body) {
    const gatewayDomain = process.env.GATEWAY_DOMAIN;
    const token = `Bearer ${process.env.GATEWAY_TOKEN}`;

    return await this.post(`${gatewayDomain}${route}`, body, {
      headers: { Authorization: token },
    });
  }
}
