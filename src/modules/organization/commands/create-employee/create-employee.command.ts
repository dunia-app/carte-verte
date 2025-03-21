import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { EmailNotValideError } from '../../../../libs/ddd/domain/value-objects/email.error'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { BooleanByWeekdayProps } from '../../domain/value-objects/boolean-by-weekday.value-object'
import {
  EmployeeAlreadyExistsError,
  EmployeeEmailDuplicatedError,
  EmployeeNameNotValideError,
} from '../../errors/employee.errors'

export type CreateEmployeeRes = {
  email: string
  res: Result<
    UUID,
    | EmployeeAlreadyExistsError
    | EmployeeNameNotValideError
    | EmployeeEmailDuplicatedError
    | EmailNotValideError
  >
}

interface CreateSingleEmployee {
  readonly organizationId: string

  readonly email: string

  readonly firstname: string

  readonly lastname: string

  readonly birthday: Date

  readonly mealTicketDays: BooleanByWeekdayProps

  readonly defaultAuthorizedOverdraft: number
}

// Command is a plain object with properties
export class CreateEmployeeCommand extends Command<CreateEmployeeRes[]> {
  constructor(props: CommandProps<CreateEmployeeCommand>) {
    super(props)
    this.employeeCommand = props.employeeCommand
  }

  readonly employeeCommand: CreateSingleEmployee[]
}
