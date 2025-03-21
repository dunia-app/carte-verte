import { Inject } from '@nestjs/common'
import { CommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../database/user/user.repository'
import { UserRepositoryPort } from '../../database/user/user.repository.port'
import { DeleteUserCommand } from './delete-user.command'

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const found = await this.userRepo.findOneByIdOrThrow(command.userId)
    await this.userRepo.delete([found])
  }
}
