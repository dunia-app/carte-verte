import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { validate, ValidatorOptions } from 'class-validator'

export interface GraphqlValidationPipeOptions extends ValidatorOptions {
  transform?: boolean
}

@Injectable()
export class GraphqlValidationPipe implements PipeTransform<any> {
  protected isTransformEnabled: boolean
  protected validatorOptions: ValidatorOptions

  constructor(
    @Inject()
    options?: GraphqlValidationPipeOptions,
  ) {
    options = options || {}
    const { transform, ...validatorOptions } = options
    this.isTransformEnabled = !!transform
    this.validatorOptions = validatorOptions
  }

  public async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata
    if (!metatype || !this.toValidate(value, metadata)) {
      return value
    }
    const entity = plainToInstance(metatype, value)
    const errors = await validate(entity, this.validatorOptions)
    if (errors.length > 0) {
      throw new BadRequestException(errors)
    }
    return this.isTransformEnabled
      ? entity
      : Object.keys(this.validatorOptions).length > 0
      ? instanceToPlain(entity)
      : value
  }

  private toValidate(value: any, metadata: ArgumentMetadata): boolean {
    const { metatype, type } = metadata
    if (type === 'custom') {
      return false
    }
    const types = [String, Boolean, Number, Array, Object]
    return (
      !types.find((t) => metatype === t) &&
      !(metatype == null) &&
      !(value == null)
    )
  }
}
