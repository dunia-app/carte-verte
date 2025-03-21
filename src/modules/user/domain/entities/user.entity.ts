import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { UserCreatedDomainEvent } from '../events/user-created.domain-event'
import { IpAddress } from '../value-objects/ip-address.value-object'
import { Name } from '../value-objects/name.value-object'
import { UserRoles } from './user.types'

// Properties that are needed for a user creation
export interface CreateUserProps {
  name: Name
  role: UserRoles
}

// All properties that a User has
export interface UserProps extends CreateUserProps {
  ipAdresses: Set<string>
}

export class UserEntity extends AggregateRoot<UserProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateUserProps): UserEntity {
    const id = UUID.generate()
    /* Setting a default role since we are not accepting it during creation. */
    const props: UserProps = { ...create, ipAdresses: new Set() }
    const user = new UserEntity({ id, props })
    /* adding "UserCreated" Domain Event that will be published
    eventually so an event handler somewhere may receive it and do an
    appropriate action */
    user.addEvent(
      new UserCreatedDomainEvent({
        aggregateId: id.value,
        role: user.role,
        ...props.name.unpack(),
      }),
    )
    return user
  }

  get role(): UserRoles {
    return this.props.role
  }

  get name(): Name {
    return this.props.name
  }

  set name(name: Name) {
    this.props.name = name
  }

  addIpAddress(ipAddress: IpAddress): boolean {
    const isNewIp = !this.props.ipAdresses.has(ipAddress.value)
    this.props.ipAdresses.add(ipAddress.value)
    return isNewIp
  }

  validate(): void {}
}
