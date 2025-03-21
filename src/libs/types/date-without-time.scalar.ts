import { CustomScalar, Scalar } from '@nestjs/graphql';
import { GraphQLScalarType, Kind, ValueNode } from 'graphql';
import { DateTime } from 'luxon';
import { logger } from '../../helpers/application.helper';

const logId = '405ceb5e-53ad-4698-8d15-cadeb1097a5a' ;

function formatDatetoStr(value : unknown) : string {
  logger.log(`logId : ${logId}, formatDateToStr, value : ${value}`);
  try {
    const valueStr = String(value);
    logger.log(`logId : ${logId}, formatDateToStr, valueStr: ${valueStr}`);
    const formattedDate = DateTime.fromJSDate(new Date(valueStr)).toFormat('yyyy-MM-dd');
    logger.log(`logId : ${logId}, formatDateToStr, formattedDate: ${formattedDate}`);
    return formattedDate ;
  } catch(error){
    throw new Error(`Invalid date, value : ${value}. Error : ${error}`)
  }
}

function formatStrToDate(value: unknown): Date {
  logger.log(`logId : ${logId}, formatStrToDate, value : ${value}`);
  try{
    const valueStr = String(value);
    logger.log(`logId : ${logId}, formatStrToDate, valueStr: ${valueStr}`);
    const formattedDate = DateTime.fromJSDate(new Date(valueStr)).toJSDate();    
    logger.log(`logId : ${logId}, formatStrToDate, formattedDate: ${formattedDate}`);
    return formattedDate ;
  }catch(error){
    throw new Error(`Invalid date, value : ${value}. Error : ${error}`)
  }
}

export const DateWithoutTimeScalar = new GraphQLScalarType<string, string>({
  name: 'Date',
  description: 'Date without time custom scalar type',
  serialize: (value: unknown) => formatDatetoStr(value),
  parseValue: (value: unknown) => formatDatetoStr(value),
  parseLiteral: (ast: ValueNode) =>
    ast.kind === Kind.STRING ? DateTime.fromISO(ast.value).toFormat('yyyy-MM-dd') : '',
});

@Scalar('DateTime', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: unknown): Date {
    return formatStrToDate(value);
  }

  // Return date as string in local timezone
  serialize(value: unknown): string {
    return formatDatetoStr(value);
  }

  parseLiteral(ast: ValueNode): Date {
    logger.log(`logId : ${logId}, parseLiteral, value : ${ast}`);
    if (ast.kind === Kind.STRING) {
      const formattedDate = DateTime.fromISO(ast.value).toJSDate();
      logger.log(`logId: ${logId}, parseLiteral, formattedDate: ${formattedDate}`)
      return formattedDate ;
    } else {
      throw new Error('Invalid date');
    }
  }
}