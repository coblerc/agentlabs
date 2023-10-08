import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { mailerConfig } from '../mailer/mailer.config';
import { membersConfig } from '../members/members.config';
import { projectsConfig } from '../projects/projects.config';
import { usersConfig } from '../users/users.config';
import { validateEnv } from './validate-env';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [usersConfig, membersConfig, mailerConfig, projectsConfig],
      cache: true,
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
})
export class ConfigModule {}
