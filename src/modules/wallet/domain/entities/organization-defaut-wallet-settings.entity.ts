import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { AdvantageList } from '../value-objects/advantage-list.value-object'

const defaultAdvantageList = new AdvantageList({
  MEALTICKET: true,
  CULTURALCHEQUE: false,
  MOBILITYFORFAIT: false,
  GIFTCARD: false,
  NONE: true,
  EXTERNAL: false,
})

export interface CreateOrganizationDefautWalletSettingsProps {
  organizationId: UUID
  name: string
}

export interface OrganizationDefautWalletSettingsProps
  extends CreateOrganizationDefautWalletSettingsProps {
  advantageList: AdvantageList
}

export class OrganizationDefautWalletSettingsEntity extends AggregateRoot<OrganizationDefautWalletSettingsProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateOrganizationDefautWalletSettingsProps,
  ): OrganizationDefautWalletSettingsEntity {
    const id = UUID.generate()
    const props: OrganizationDefautWalletSettingsProps = {
      ...create,
      advantageList: defaultAdvantageList,
    }
    const organizationDefautWalletSettings =
      new OrganizationDefautWalletSettingsEntity({
        id,
        props,
      })

    return organizationDefautWalletSettings
  }

  get advantageList(): AdvantageList {
    return this.props.advantageList
  }

  // TO DO : when updating advantageList, create wallet for existing employee

  public validate(): void {}
}
