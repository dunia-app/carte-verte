import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { EmployeeOrmEntity } from '../../database/employee/employee.orm-entity'
import { EmployeeRepository } from '../../database/employee/employee.repository'
import {
  BooleanByWeekday,
  booleanByWeekdayDefault,
} from '../value-objects/boolean-by-weekday.value-object'
import { EmployeeCode } from '../value-objects/employee-code.value-object'
import { EmployeeEntity, EmployeeProps } from './employee.entity'
import moment = require('moment')

export interface EmployeeFactoryProps {
  organizationId: UUID
  userId: UUID
  address?: Address
  mealTicketDays?: BooleanByWeekday
  codeFailedAttemps?: number
  activatedAt?: DateVO
  cguAcceptedAt?: DateVO
  code?: EmployeeCode
  willBeDeletedAt?: DateVO
  freezedAt?: DateVO
  deviceIds?: string[]
}

export class EmployeeFactory extends BaseFactory<
  EmployeeEntity,
  EmployeeFactoryProps,
  EmployeeRepository,
  EmployeeOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(EmployeeRepository)
  }

  protected buildEntity(defaultData: EmployeeFactoryProps) {
    const props: EmployeeProps = {
      address: new Address({
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        street: faker.location.street(),
      }),
      mealTicketDays: booleanByWeekdayDefault,
      birthday: new DateVO(moment().subtract(20, 'year').toDate()),
      defaultAuthorizedOverdraft: 100,
      externalEmployeeId: 'test',
      refreshTokens: [],
      deviceIds: [],
      codeFailedAttemps: 0,
      ...defaultData,
    }
    return new EmployeeEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
