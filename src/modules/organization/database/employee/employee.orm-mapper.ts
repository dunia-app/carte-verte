import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  EmployeeEntity,
  EmployeeProps,
} from '../../domain/entities/employee.entity'
import { BooleanByWeekday } from '../../domain/value-objects/boolean-by-weekday.value-object'
import { EmployeeCode } from '../../domain/value-objects/employee-code.value-object'
import { RefreshToken } from '../../domain/value-objects/refresh-token.value-object'
import { EmployeeOrmEntity } from './employee.orm-entity'

export class EmployeeOrmMapper extends OrmMapper<
  EmployeeEntity,
  EmployeeOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: EmployeeEntity,
  ): OrmEntityProps<EmployeeOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<EmployeeOrmEntity> = {
      organizationId: props.organizationId.value,
      userId: props.userId.value,
      externalEmployeeId: props.externalEmployeeId,
      activatedAt: props.activatedAt?.value,
      code: props.code?.value,
      refreshTokens: props.refreshTokens
        .filter((it) => it.isNotExpired)
        .map((it) => it.unpack()),
      mealTicketDays: props.mealTicketDays.unpack(),
      cguAcceptedAt: props.cguAcceptedAt?.value,
      codeFailedAttemps: props.codeFailedAttemps,
      willBeDeletedAt: props.willBeDeletedAt
        ? props.willBeDeletedAt.value
        : null,
      freezedAt: props.freezedAt ? props.freezedAt.value : null,
      birthday: props.birthday.date,
      defaultAuthorizedOverdraft: props.defaultAuthorizedOverdraft,
      deviceIds: props.deviceIds,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: EmployeeOrmEntity,
  ): EntityProps<EmployeeProps> {
    const id = new UUID(ormEntity.id)
    const props: EmployeeProps = {
      organizationId: new UUID(ormEntity.organizationId),
      userId: new UUID(ormEntity.userId),
      externalEmployeeId: ormEntity.externalEmployeeId
        ? ormEntity.externalEmployeeId
        : undefined,
      activatedAt: ormEntity.activatedAt
        ? new DateVO(ormEntity.activatedAt)
        : undefined,
      code: ormEntity.code ? new EmployeeCode(ormEntity.code) : undefined,
      refreshTokens: ormEntity.refreshTokens.map(
        (it) =>
          new RefreshToken({
            token: it.token,
            expiresIn: new Date(it.expiresIn),
            deviceId: it.deviceId,
          }),
      ),
      mealTicketDays: new BooleanByWeekday(ormEntity.mealTicketDays),
      cguAcceptedAt: ormEntity.cguAcceptedAt
        ? new DateVO(ormEntity.cguAcceptedAt)
        : undefined,
      codeFailedAttemps: ormEntity.codeFailedAttemps,
      willBeDeletedAt: ormEntity.willBeDeletedAt
        ? new DateVO(ormEntity.willBeDeletedAt)
        : undefined,
      freezedAt: ormEntity.freezedAt
        ? new DateVO(ormEntity.freezedAt)
        : undefined,
      birthday: new DateVO(ormEntity.birthday),
      defaultAuthorizedOverdraft: ormEntity.defaultAuthorizedOverdraft,
      deviceIds: ormEntity.deviceIds,
    }
    return { id, props }
  }
}
