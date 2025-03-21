import { PaymentSolutionOrmEntity } from '../../../modules/merchant/database/payment-solution/payment-solution.orm-entity'
import { newConnection } from '../create_connection'
import { paymentSolutions } from './payment-solutions'

export async function paymentSolutionsFixtures() {
  const connection = await newConnection({ logging: false })
  const repo = connection.getRepository(PaymentSolutionOrmEntity)
  const paymentSolutionEntities = paymentSolutions.map(
    (paymentSolution) => new PaymentSolutionOrmEntity(paymentSolution),
  )

  const existingPaymentSolutions = await repo.find()
  const paymentSolutionToSave = paymentSolutionEntities.filter(
    (paymentSolution) =>
      !existingPaymentSolutions.find(
        (existingPaymentSolution) =>
          existingPaymentSolution.name === paymentSolution.name,
      ),
  )

  if (paymentSolutionToSave.length) {
    console.log('paymentSolutions fixtures pushing')
    console.time(`saving ${paymentSolutionToSave.length} paymentSolutions`)
    await repo.save(paymentSolutionToSave)
    console.timeEnd(`saving ${paymentSolutionToSave.length} paymentSolutions`)
  }
  connection.destroy()
}
