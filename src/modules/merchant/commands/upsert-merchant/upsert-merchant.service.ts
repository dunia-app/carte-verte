import { DataSource, InsertResult } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { MerchantCategoryRepositoryPort } from '../../database/merchant-category/merchant-category.repository.port'
import { MerchantLabelOrmEntity } from '../../database/merchant-label/merchant-label.orm-entity'
import { MerchantMerchantFilterOrmEntity } from '../../database/merchant-merchant-filter/merchant-merchant-filter.orm-entity'
import { MerchantMerchantOrganizationOrmEntity } from '../../database/merchant-merchant-organization/merchant-merchant-organization.orm-entity'
import { MerchantMerchantOrganizationRepositoryPort } from '../../database/merchant-merchant-organization/merchant-merchant-organization.repository.port'
import { MerchantRepositoryPort } from '../../database/merchant/merchant.repository.port'
import { MerchantCategoryEntity } from '../../domain/entities/merchant-category.entity'
import { MerchantMerchantOrganizationEntity } from '../../domain/entities/merchant-merchant-organization.entity'
import {
  MerchantEntity,
  MerchantProps,
} from '../../domain/entities/merchant.entity'
import { MerchantGrades } from '../../domain/value-objects/merchant-grades.value-object'
import {
  DefaultMerchantError,
  MccNotFoundError,
  MerchantNotFoundError,
} from '../../errors/merchant.errors'
import { UpsertMerchantCommand } from './upsert-merchant.command'

interface UpsertMerchantData {
  existingMerchant?: MerchantEntity
  existingMcc?: MerchantCategoryEntity
  existingMmo?: MerchantMerchantOrganizationEntity
  mid: string
}

export class UpsertMerchantService {
  private readonly merchantRepo: MerchantRepositoryPort
  private readonly merchantCategoryRepo: MerchantCategoryRepositoryPort
  private readonly merchantMerchantOrganizationRepo: MerchantMerchantOrganizationRepositoryPort
  private readonly command: UpsertMerchantCommand
  private readonly dataSource: DataSource

  constructor(
    unitOfWork: UnitOfWork,
    command: UpsertMerchantCommand,
    dataSource: DataSource,
  ) {
    /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */

    this.merchantRepo = unitOfWork.getMerchantRepository(command.correlationId)
    this.merchantCategoryRepo = unitOfWork.getMerchantCategoryRepository(
      command.correlationId,
    )
    this.merchantMerchantOrganizationRepo =
      unitOfWork.getMerchantMerchantOrganizationRepository(
        command.correlationId,
      )

    this.command = command
    this.dataSource = dataSource
  }

  private getMid(existingMerchant: MerchantEntity | undefined): string {
    if (this.command.mid) {
      return this.command.mid
    }

    if (existingMerchant?.mid) {
      return existingMerchant.mid
    }

    if (!this.command.siret) {
      throw new Error('SIRET is required when no merchant ID is provided')
    }

    return `EKIPTEMPORARY*${this.command.siret}`
  }

  private async findExistingMerchant(): Promise<UpsertMerchantData> {
    const existingMerchantIdPromise = this.command.merchantId
      ? this.merchantRepo.findOneById(this.command.merchantId)
      : undefined
    const existingMidPromise = this.command.mid
      ? this.merchantRepo.findOneByMid(this.command.mid)
      : undefined
    const existingMccPromise =
      this.command.mcc && this.command.mcc.value
        ? this.merchantCategoryRepo.findOneByMcc(this.command.mcc.value)
        : undefined
    const [existingMerchantById, existingMerchantByMid, existingMcc] =
      await Promise.all([
        existingMerchantIdPromise,
        existingMidPromise,
        existingMccPromise,
      ])

    const existingMerchant = existingMerchantById ?? existingMerchantByMid
    const existingMmo =
      existingMerchant && existingMerchant.mid
        ? await this.merchantMerchantOrganizationRepo.findOneByMid(
            existingMerchant.mid,
          )
        : undefined
    const mid = this.getMid(existingMerchant)

    return {
      existingMerchant: existingMerchant,
      existingMcc: existingMcc,
      existingMmo: existingMmo,
      mid: mid,
    }
  }

  private updateMerchantInitializeProps(oldOne: MerchantProps): MerchantProps {
    const props: MerchantProps = {
      ...oldOne,
      advantageForm: this.command.advantageForm,
      pointOfSaleType: this.command.pointOfSaleType,
      description: this.command.description,
      attribute: this.command.attribute,
      phone: this.command.phone,
      email: this.command.email,
      website: this.command.website,
      imageLinks: this.command.imageLinks,
      labelName: this.command.labelName,
      deliveryCities: this.command.deliveryCities,
      reviewLink: this.command.reviewLink,
      isHidden: this.command.isHidden ?? oldOne.isHidden,
      isBlacklisted: this.command.isBlacklisted ?? oldOne.isBlacklisted,
    }

    return props
  }

  private updateMerchantSetMid(props: MerchantProps) {
    if (!isUndefined(this.command.mid)) {
      props.mid = this.command.mid
    }
  }

  private updateMerchantSetName(props: MerchantProps) {
    if (!isUndefined(this.command.name)) {
      props.name = this.command.name
    }
  }

  private updateMerchantSetAddress(
    props: MerchantProps,
    oldOne: MerchantProps,
  ) {
    if (
      !isUndefined(this.command.city) ||
      !isUndefined(this.command.postalCode) ||
      !isUndefined(this.command.street) ||
      !isUndefined(this.command.longitude) ||
      !isUndefined(this.command.latitude)
    ) {
      props.address = new Address({
        city: this.command.city ?? oldOne.address!.city,
        postalCode: this.command.postalCode ?? oldOne.address!.postalCode,
        street: this.command.street ?? oldOne.address!.street,
        longitude: this.command.longitude ?? oldOne.address?.longitude,
        latitude: this.command.latitude ?? oldOne.address?.latitude,
      })
    }
  }

  private updateMerchantSetGrades(props: MerchantProps, oldOne: MerchantProps) {
    if (
      !isUndefined(this.command.bio) ||
      !isUndefined(this.command.local) ||
      !isUndefined(this.command.vegetarian) ||
      !isUndefined(this.command.antiwaste) ||
      !isUndefined(this.command.nowaste) ||
      !isUndefined(this.command.inclusive)
    ) {
      props.grades = new MerchantGrades({
        bio: this.command.bio ?? oldOne.grades?.bio ?? 0,
        local: this.command.local ?? oldOne.grades?.local ?? 0,
        vegetarian: this.command.vegetarian ?? oldOne.grades?.vegetarian ?? 0,
        antiwaste: this.command.antiwaste ?? oldOne.grades?.antiwaste ?? 0,
        nowaste: this.command.nowaste ?? oldOne.grades?.nowaste ?? 0,
        inclusive: this.command.inclusive ?? oldOne.grades?.inclusive ?? 0,
      })
    }
  }

  private updateMerchantSetMcc(
    props: MerchantProps,
    upsertMerchantData: UpsertMerchantData,
  ) {
    if (this.command.mcc?.value) {
      props.merchantCategory = upsertMerchantData.existingMcc
    }
  }

  private updateMerchant(
    upsertMerchantData: UpsertMerchantData,
  ): MerchantEntity {
    if (isUndefined(upsertMerchantData.existingMerchant)) {
      throw new Error('Can not update merchant if it does not exist')
    }

    const oldOne = upsertMerchantData.existingMerchant.getPropsCopy()

    const props = this.updateMerchantInitializeProps(oldOne)

    this.updateMerchantSetMid(props)
    this.updateMerchantSetName(props)
    this.updateMerchantSetAddress(props, oldOne)
    this.updateMerchantSetGrades(props, oldOne)
    this.updateMerchantSetMcc(props, upsertMerchantData)

    if (upsertMerchantData.existingMerchant.update(props)) {
      return upsertMerchantData.existingMerchant
    } else {
      throw new Error('Update of merchant failed')
    }
  }

  private createMerchantInitializeProps(
    upsertMerchantData: UpsertMerchantData,
  ): MerchantProps {
    if (!this.command.name) {
      throw new Error('You need the name to create the merchant')
    }

    const props: MerchantProps = {
      mid: upsertMerchantData.mid,
      advantageForm: this.command.advantageForm,
      pointOfSaleType: this.command.pointOfSaleType,
      description: this.command.description,
      attribute: this.command.attribute,
      phone: this.command.phone,
      email: this.command.email,
      website: this.command.website,
      imageLinks: this.command.imageLinks,
      labelName: this.command.labelName,
      deliveryCities: this.command.deliveryCities,
      merchantCategory: this.command.mcc
        ? upsertMerchantData.existingMcc
        : undefined,
      name: this.command.name,
      reviewLink: this.command.reviewLink,
      isHidden: this.command.isHidden ?? false,
      isBlacklisted: this.command.isBlacklisted ?? false,
    }

    return props
  }

  private createMerchantSetAddress(props: MerchantProps) {
    if (this.command.city && this.command.postalCode && this.command.street) {
      props.address = new Address({
        city: this.command.city,
        postalCode: this.command.postalCode,
        street: this.command.street,
        longitude: this.command.longitude,
        latitude: this.command.latitude,
      })
    }
  }

  private createMerchantSetGrades(props: MerchantProps) {
    props.grades = new MerchantGrades({
      bio: this.command.bio ?? 0,
      local: this.command.local ?? 0,
      vegetarian: this.command.vegetarian ?? 0,
      antiwaste: this.command.antiwaste ?? 0,
      nowaste: this.command.nowaste ?? 0,
      inclusive: this.command.inclusive ?? 0,
    })
  }

  private createMerchant(
    upsertMerchantData: UpsertMerchantData,
  ): MerchantEntity {
    const props = this.createMerchantInitializeProps(upsertMerchantData)

    this.createMerchantSetAddress(props)
    this.createMerchantSetGrades(props)

    return new MerchantEntity({
      id: UUID.generate(),
      props: props,
    })
  }

  private upsertMerchantLabelPromise(): Promise<InsertResult> | undefined {
    if (this.command.labelName) {
      return this.dataSource.getRepository(MerchantLabelOrmEntity).upsert(
        {
          name: this.command.labelName,
        },
        ['name'],
      )
    } else {
      return undefined
    }
  }

  private upsertMmoPromise(
    upsertMerchantData: UpsertMerchantData,
  ): Promise<InsertResult> | undefined {
    if (this.command.siret) {
      return this.dataSource
        .getRepository(MerchantMerchantOrganizationOrmEntity)
        .upsert(
          {
            siret: this.command.siret,
            mid: upsertMerchantData.mid,
            merchantName:
              this.command.name ?? upsertMerchantData.existingMerchant?.name,
          },
          ['mid', 'merchantName'],
        )
    } else if (upsertMerchantData.existingMmo && this.command.mid) {
      return this.dataSource
        .getRepository(MerchantMerchantOrganizationOrmEntity)
        .upsert(
          {
            siret: upsertMerchantData.existingMmo.siret,
            mid: this.command.mid,
            merchantName:
              this.command.name ?? upsertMerchantData.existingMerchant?.name,
          },
          ['mid', 'merchantName'],
        )
    } else {
      return undefined
    }
  }

  private upsertMerchantMerchantFilterPromise(
    upsertMerchantData: UpsertMerchantData,
  ): Promise<InsertResult> | undefined {
    if (this.command.filterCodes) {
      return this.dataSource
        .getRepository(MerchantMerchantFilterOrmEntity)
        .upsert(
          this.command.filterCodes.map((code) => {
            return {
              mid: upsertMerchantData.existingMerchant
                ? upsertMerchantData.mid
                : this.command.mid,
              code: code,
            }
          }),
          ['mid', 'code'],
        )
    } else {
      return undefined
    }
  }

  private async upsertPromises(
    upsertMerchantData: UpsertMerchantData,
  ): Promise<void> {
    await Promise.all([
      this.upsertMerchantLabelPromise(),
      this.upsertMmoPromise(upsertMerchantData),
      this.upsertMerchantMerchantFilterPromise(upsertMerchantData),
    ])
  }

  async upsertMerchant(): Promise<
    Result<'updated' | 'inserted', MccNotFoundError>
  > {
    const upsertMerchantData = await this.findExistingMerchant()

    let newMerchant: MerchantEntity | undefined

    if (upsertMerchantData.existingMerchant) {
      newMerchant = this.updateMerchant(upsertMerchantData)
    } else {
      if (!this.command.name) {
        return Result.err(
          new MerchantNotFoundError(
            'Merchant has not been found with mid/merchantId and cannot be created because there is no name provided.',
          ),
        )
      }
      newMerchant = this.createMerchant(upsertMerchantData)
    }

    try {
      await this.upsertPromises(upsertMerchantData)
    } catch (e) {
      logger.error(`Error in upsertMerchant: ${e}`)
      return Result.err(
        new DefaultMerchantError(
          `Something went wrong when upserting merchant : ${e}`,
        ),
      )
    }

    if (newMerchant) {
      await this.merchantRepo.save(newMerchant)
    }
    return Result.ok(
      upsertMerchantData.existingMerchant ? 'updated' : 'inserted',
    )
  }
}
