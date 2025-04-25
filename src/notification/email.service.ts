import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs-extra';
import * as Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { EmailType } from './enums/notification-type.enum';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async renderTemplate(type: EmailType, data: any) {
    const templatePath = `src/notification/templates/${type}.hbs`;

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${type}`);
    }

    const source = fs.readFileSync(templatePath, { encoding: 'utf8' });
    const template = Handlebars.compile(source);
    const html = template(data);

    return {
      subject: data.subject || 'Notification',
      text: html.replace(/<[^>]+>/g, ''), // Strip HTML for plain text version
      html,
    };
  }

  async sendEmail(
    to: string,
    type: EmailType,
    data: any,
  ): Promise<void> {
    const emailContent = await this.renderTemplate(type, data);

    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  }
}
