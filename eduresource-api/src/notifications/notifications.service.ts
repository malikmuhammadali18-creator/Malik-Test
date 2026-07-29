import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import twilio from 'twilio';

export type NotificationType =
  | 'resource_approved'
  | 'resource_rejected'
  | 'resource_shared'
  | 'password_reset'
  | 'announcement';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly twilioClient;
  private readonly twilioFromNumber: string | undefined;

  constructor(private prisma: PrismaService) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async create(userId: string, type: NotificationType, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async broadcastSms(numbers: string[], message: string) {
    if (!numbers?.length) {
      throw new BadRequestException('At least one destination number is required.');
    }

    if (!message?.trim()) {
      throw new BadRequestException('Message text is required.');
    }

    if (!this.twilioClient || !this.twilioFromNumber) {
      this.logger.warn('Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
      throw new BadRequestException('SMS provider is not configured on the server.');
    }

    const sendPromises = numbers.map((to) =>
      this.twilioClient!.messages.create({
        body: message,
        from: this.twilioFromNumber as string,
        to,
      }),
    );

    const results = await Promise.all(sendPromises);
    this.logger.log(`Broadcast SMS sent to ${results.length} numbers.`);
    return { sent: results.length, results };
  }
}
