import { applyDecorators } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

export function ConditionalCron(cronTime: string | CronExpression, options?: { name?: string } | boolean) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof options === 'boolean') {
      options = { name: propertyKey };
    }
    if (process.env.ENABLE_CRON_JOBS === 'true') {
      return applyDecorators(Cron(cronTime, options))(target, propertyKey, descriptor);
    }
    return descriptor;
  };
}
