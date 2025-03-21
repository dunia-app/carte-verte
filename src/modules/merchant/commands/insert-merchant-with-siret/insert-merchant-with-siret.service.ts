import _ from 'lodash'
import { DataSource, DeepPartial } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { objectArrayToMap } from '../../../../helpers/object.helper'
import { capitalizeEachWords } from '../../../../helpers/string.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { FindPlaceService } from '../../../../infrastructure/place-autocomplete/find-place/find-place.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { MerchantLabelOrmEntity } from '../../database/merchant-label/merchant-label.orm-entity'
import { MerchantMerchantOrganizationOrmEntity } from '../../database/merchant-merchant-organization/merchant-merchant-organization.orm-entity'
import { MerchantMerchantOrganizationRepositoryPort } from '../../database/merchant-merchant-organization/merchant-merchant-organization.repository.port'
import { MerchantOrganizationRepositoryPort } from '../../database/merchant-organization/merchant-organization.repository.port'
import { MerchantRepositoryPort } from '../../database/merchant/merchant.repository.port'
import { MerchantOrganizationEntity } from '../../domain/entities/merchant-organization.entity'
import {
  MerchantEntity,
  MerchantProps,
} from '../../domain/entities/merchant.entity'
import {
  AdvantageForm,
  PointOfSaleType,
} from '../../domain/entities/merchant.types'
import { MerchantGrades } from '../../domain/value-objects/merchant-grades.value-object'
import { InsertMerchantWithSiretCommand } from './insert-merchant-with-siret.command'

export async function insertMerchantWithSiret(
  command: InsertMerchantWithSiretCommand,
  unitOfWork: UnitOfWork,
  findPlace: FindPlaceService,
  dataSource: DataSource,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const merchantOrganizationRepo: MerchantOrganizationRepositoryPort =
    unitOfWork.getMerchantOrganizationRepository(command.correlationId)
  const merchantMerchantOrganizationRepo: MerchantMerchantOrganizationRepositoryPort =
    unitOfWork.getMerchantMerchantOrganizationRepository(command.correlationId)
  const merchantRepo: MerchantRepositoryPort = unitOfWork.getMerchantRepository(
    command.correlationId,
  )

  const sirets: string[] = []
  const labelNames: {
    name: string
  }[] = []
  command.merchants.map((merchant) => {
    merchant.propositionSiret ? sirets.push(merchant.propositionSiret) : null
    merchant.fileLabelName
      ? labelNames.push({
          name: merchant.fileLabelName,
        })
      : null
  })

  const [merchantMerchantOrganizationBySiret, merchantOrganizationBySiret] =
    await Promise.all([
      objectArrayToMap(
        await merchantMerchantOrganizationRepo.findManyBySirets(sirets),
        'siret',
      ),
      objectArrayToMap(
        await merchantOrganizationRepo.findManyBySiret(sirets),
        'siret',
      ),
    ])

  const merchantToSave: MerchantEntity[] = []
  const merchantOrganizationToSave: MerchantOrganizationEntity[] = []
  const merchantMerchantOrganizationToSave: DeepPartial<MerchantMerchantOrganizationOrmEntity>[] =
    []
  for (let i = 0; i < command.merchants.length; i++) {
    const merchant = command.merchants[i]
    const city = (
      merchant.propositionCity ? merchant.propositionCity : merchant.fileCity
    )!

    if (merchant.propositionSiret) {
      const siretAlreadyLinked = merchantMerchantOrganizationBySiret.get(
        merchant.propositionSiret,
      )
      if (siretAlreadyLinked) {
        continue
      }
      const merchantOrganizationExists = merchantOrganizationBySiret.get(
        merchant.propositionSiret,
      )
      if (!merchantOrganizationExists) {
        const merchantOrga = MerchantOrganizationEntity.create({
          siret: merchant.propositionSiret,
          cntrRegistrationNumber: null,
          brandName: merchant.propositionBrandName
            ? merchant.propositionBrandName
            : merchant.fileName!,
          organizationName: merchant.propositionOrganizationName
            ? merchant.propositionOrganizationName
            : merchant.fileName!,
          naf: merchant.propositionNaf!,
          address: new Address({
            city: city,
            country: 'FRA',
            postalCode: merchant.propositionPostalCode
              ? merchant.propositionPostalCode
              : merchant.filePostalCode,
            street: merchant.propositionStreet
              ? merchant.propositionStreet
              : merchant.fileStreet,
          }),
          phone: merchant.filePhone
            ? merchant.filePhone
            : merchant.propositionPhone,
          email: merchant.fileEmail
            ? merchant.fileEmail
            : merchant.propositionEmail,
        })
        merchantOrganizationBySiret.set(merchant.propositionSiret, merchantOrga)
        merchantOrganizationToSave.push(merchantOrga)
      }
    }
    const address = new Address({
      city: city,
      street: merchant.propositionStreet,
    })

    const place = await findPlace.findAddressCoords(address)

    let email = undefined
    try {
      email = merchant.propositionEmail
        ? new Email(merchant.propositionEmail)
        : merchant.fileEmail
        ? new Email(merchant.fileEmail)
        : undefined
    } catch (e) {
      logger.warn(`wrong email address : ${merchant.propositionEmail}`)
    }
    const props: MerchantProps = {
      mid: `EKIPTEMPORARY*${merchant.propositionSiret}`,
      name: capitalizeEachWords(
        merchant.propositionBrandName
          ? merchant.propositionBrandName
          : merchant.fileName!,
      ),
      address: new Address({
        city: city,
        country: 'FRA',
        postalCode: merchant.propositionPostalCode,
        street: merchant.propositionStreet,
        latitude: place.isOk ? place.value[0].latitude : undefined,
        longitude: place.isOk ? place.value[0].longitude : undefined,
      }),
      advantageForm: AdvantageForm.CASHBACK,
      pointOfSaleType: PointOfSaleType.PHYSICAL,
      description: merchant.fileDescription,
      phone: merchant.propositionPhone
        ? merchant.propositionPhone
        : merchant.filePhone,
      email: email,
      website: merchant.fileWebsite,
      grades: new MerchantGrades({
        antiwaste: merchant.fileAntiwaste ? Number(merchant.fileAntiwaste) : 0,
        bio: merchant.fileBio ? Number(merchant.fileBio) : 0,
        inclusive: merchant.fileInclusive ? Number(merchant.fileInclusive) : 0,
        local: merchant.fileLocal ? Number(merchant.fileLocal) : 0,
        vegetarian: merchant.fileVegetarian
          ? Number(merchant.fileVegetarian)
          : 0,
        nowaste: merchant.fileNowaste ? Number(merchant.fileNowaste) : 0,
      }),
      imageLinks: merchant.fileImageLinks ? [merchant.fileImageLinks] : [],
      labelName:
        merchant.fileLabelName && merchant.fileLabelName.length > 0
          ? merchant.fileLabelName
          : undefined,
      isHidden: false,
      isBlacklisted: false,
    }
    merchantToSave.push(
      new MerchantEntity({
        id: UUID.generate(),
        props: props,
      }),
    )
    merchantMerchantOrganizationToSave.push({
      siret: merchant.propositionSiret,
      mid: props.mid,
      merchantName: props.name,
    })
  }

  await dataSource.getRepository(MerchantLabelOrmEntity).upsert(
    _.uniqWith(labelNames, (a, b) => a.name === b.name),
    ['name'],
  )

  const [_mo, _mmo, saved] = await Promise.all([
    merchantOrganizationRepo.saveMultiple(merchantOrganizationToSave),
    dataSource.getRepository(MerchantMerchantOrganizationOrmEntity).upsert(
      // remove duplicates
      _.uniqWith(merchantMerchantOrganizationToSave, (a, b) => {
        return (
          (a.mid === b.mid && a.siret === b.siret) ||
          (a.mid === b.mid && a.merchantName === b.merchantName)
        )
      }),
      ['mid', 'merchantName'],
    ),
    merchantRepo.saveMultiple(merchantToSave),
  ])
  return Result.ok(saved.length)
}
