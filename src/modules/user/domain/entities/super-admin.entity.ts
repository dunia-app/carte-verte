import bcrypt from 'bcrypt'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { WrongSuperAdminPasswordError } from '../../errors/super-admin.errors'

export interface CreateSuperAdminProps {
  userId: UUID
  password: string
}

export interface SuperAdminProps extends CreateSuperAdminProps {}

export class SuperAdminEntity extends AggregateRoot<SuperAdminProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateSuperAdminProps): SuperAdminEntity {
    const id = UUID.generate()
    const props: SuperAdminProps = {
      ...create,
    }
    const superAdmin = new SuperAdminEntity({ id, props })

    return superAdmin
  }

  get userId(): UUID {
    return this.props.userId
  }

  public async login(
    password: string,
  ): Promise<Result<boolean, WrongSuperAdminPasswordError>> {
    const r = bcrypt.compareSync(password, this.props.password)
    if (!r) {
      return Result.err(new WrongSuperAdminPasswordError())
    }
    return Result.ok(true)
  }

  public validate(): void {}
}
