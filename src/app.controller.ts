import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Param,
  Query,
  Render,
} from '@nestjs/common';
import { CustomHttpService } from './shared/customHttpService';
import { UserService } from './domain/users/user.service';
import { isEmpty } from 'lodash';
import { UserRepo } from './domain/users/user.repo';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepo: UserRepo,
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
  async getWithRapidApi(@Query() param) {
    if (!param?.url) throw new BadRequestException();

    const profileId = (param.url as string)?.split('/in/')[1]?.split('/')[0];

    const forProfileUrlCheck = (param.url as string)?.split(
      'https://www.linkedin.com',
    );

    if (!forProfileUrlCheck[1]?.startsWith('/in/')) {
      throw new HttpException('Please input only profile url', 400);
    }

    const profileInDb = await this.userService.getByLinkedinProfileId(
      profileId,
    );

    if (!isEmpty(profileInDb)) {
      return profileInDb;
      // throw new HttpException('User already exist', 409);
    }

    const profile = await this.customHttpService.post(
      'https://linkedin-profiles-and-company-data.p.rapidapi.com/profile-details',
      {
        profile_id: profileId,
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

    await this.userRepo.insert({
      linkedin_profile_id: profile.profile_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      profile_picture: profile.profile_picture,
      skills: { data: profile.skills },
      summary: profile.summary,
      sub_title: profile.sub_title,
      birth_date: profile.birth_date,
      location: { data: profile.location },
      position_groups: { data: profile.position_groups },
      education: { data: profile.education },
      industry: profile.industry,
    });

    return profile;
  }
}
