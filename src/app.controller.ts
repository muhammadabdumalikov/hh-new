import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import { CustomHttpService } from './shared/customHttpService';
import { getLinkedinPage } from './parser';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly customHttpService: CustomHttpService,
  ) {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Get('auth/linkedin/callback')
  async callbackLinkedin(@Query() param) {
    const bodyData = {
      code: param.code,
      grant_type: 'authorization_code',
      client_id: '77cnwgnrwonq6m',
      client_secret: 'zUe0OOuIcNcuDor0',
      redirect_uri: 'http://localhost:3000/auth/linkedin/callback',
    };

    const data = await this.customHttpService.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      bodyData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const userInfo = await this.customHttpService.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${data['access_token']}`,
        },
      },
    );

    return userInfo;
  }

  @Get('profile')
  async getWithRapidApi() {
    const profile = await this.customHttpService.post(
      'https://linkedin-profiles-and-company-data.p.rapidapi.com/profile-details',
      {
        profile_id: 'muhammad-abdumalikov-89395b20a',
        profile_type: 'personal',
        contact_info: false,
        recommendations: false,
        related_profiles: false,
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key':
            '0a17149b0amshf54a452b6fdf72fp1c7735jsn131ea2f23348',
          'X-RapidAPI-Host':
            'linkedin-profiles-and-company-data.p.rapidapi.com',
        },
      },
    );

    return profile;
  }
}
