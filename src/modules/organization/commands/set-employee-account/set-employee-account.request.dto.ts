import { ArgsType, InputType } from '@nestjs/graphql'
import { SetEmployeeCodeRequest } from '../set-employee-code/set-employee-code.request.dto'

@ArgsType()
@InputType()
export class SetEmployeeAccountRequest extends SetEmployeeCodeRequest {}
