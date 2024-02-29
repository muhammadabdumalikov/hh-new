import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Query,
  Render,
} from '@nestjs/common';
import { CustomHttpService } from './shared/customHttpService';
import { UserService } from './domain/users/user.service';
import { isEmpty } from 'lodash';
import { UserRepo } from './domain/users/user.repo';
import { formatLinkedinBirthDate } from './shared/helpers';
import { CompanyService } from './domain/company/company.service';
import { CompanyRepo } from './domain/company/company.repo';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepo: UserRepo,
    private readonly companyRepo: CompanyRepo,
    private readonly companyService: CompanyService,
    private readonly customHttpService: CustomHttpService,
  ) { }

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

  @Get('personal-profile')
  async getPersonalProfileWithRapidApi(@Query() param) {
    if (!param?.url) throw new BadRequestException();

    const profileId = (param.url as string)?.split('/in/')[1]?.split('/')[0];

    const forProfileUrlCheck = (param.url as string)?.split(
      'https://www.linkedin.com',
    );

    if (!forProfileUrlCheck[1]?.startsWith('/in/')) {
      throw new HttpException('Please input only personal profile url', 400);
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
        contact_info: true,
        recommendations: false,
        related_profiles: false,
      },
      {
        // headers: {
        //   'content-type': 'application/json',
        //   'X-RapidAPI-Key':
        //     '0a17149b0amshf54a452b6fdf72fp1c7735jsn131ea2f23348',
        //   'X-RapidAPI-Host':
        //     'linkedin-profiles-and-company-data.p.rapidapi.com',
        // },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key':
            '29096b52efmsh1cc856bc2911940p1ca23bjsndb3af393ff20',
          'X-RapidAPI-Host':
            'linkedin-profiles-and-company-data.p.rapidapi.com',
        },
      },
    );

    if (!(profile?.profile_id || profile.first_name)) {
      throw new HttpException('User not found', 404);
    }

    await this.userRepo.insert({
      linkedin_profile_id: profile.profile_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      profile_picture: profile.profile_picture,
      skills: { data: profile.skills },
      summary: profile.summary,
      sub_title: profile.sub_title,
      birth_date: formatLinkedinBirthDate(profile.birth_date),
      location: { data: profile.location },
      position_groups: { data: profile.position_groups },
      education: { data: profile.education },
      contact_info: { data: profile.contact_info },
      industry: profile.industry,
    });

    return profile;
  }

  @Get('company-profile')
  async getCompanyProfileWithRapidApi(@Query() param) {
    if (!param?.url) throw new BadRequestException();

    const profileId = (param.url as string)
      ?.split('/company/')[1]
      ?.split('/')[0];

    const forProfileUrlCheck = (param.url as string)?.split(
      'https://www.linkedin.com',
    );

    if (!forProfileUrlCheck[1]?.startsWith('/company/')) {
      throw new HttpException('Please input only company profile url', 400);
    }

    const profileInDb = await this.companyRepo.getByLinkedinProfileId(
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
        profile_type: 'company',
        contact_info: true,
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
        // headers: {
        //   'content-type': 'application/json',
        //   'X-RapidAPI-Key':
        //     '29096b52efmsh1cc856bc2911940p1ca23bjsndb3af393ff20',
        //   'X-RapidAPI-Host':
        //     'linkedin-profiles-and-company-data.p.rapidapi.com',
        // },
      },
    );

    if (!profile?.details?.universal_name) {
      throw new HttpException('Company not found', 404);
    }

    await this.companyRepo.insert({
      linkedin_profile_id: profile.details.universal_name,
      name: profile.details.name,
      tagline: profile.details.tagline,
      industries: { data: profile.details.industries },
      description: profile.details.description,
      followers: String(profile.details.followers),
      profile_picture: profile.details.images?.logo,
      locations: {
        headquarter: profile.details.locations?.headquarter,
        data: (profile.details.locations?.others as [])?.map((item: any) => {
          return {
            geographic_area: item?.geographic_area,
            city: item?.city,
            country: item?.country,
          };
        }),
      },
      background_image: profile.details.images?.cover,
      specialities: { data: profile.details.specialities },
      urls: profile.details.urls,
      staff: profile.details.staff,
      founded_year: Number(profile.details.founded?.year),
      phone: profile.details.phone,
    });

    return {
      linkedin_profile_id: profile.details.universal_name,
      name: profile.details.name,
      tagline: profile.details.tagline,
      industries: { data: profile.details.industries },
      description: profile.details.description,
      followers: String(profile.details.followers),
      profile_picture: profile.details.images?.logo,
      locations: {
        headquarter: profile.details.locations?.headquarter,
        data: (profile.details.locations?.others as [])?.map((item: any) => {
          return {
            geographic_area: item?.geographic_area,
            city: item?.city,
            country: item?.country,
          };
        }),
      },
      background_image: profile.details.images?.cover,
      specialities: { data: profile.details.specialities },
      urls: profile.details.urls,
      staff: profile.details.staff,
      founded_year: Number(profile.details.founded?.year),
      phone: profile.details.phone,
    };
  }
}
