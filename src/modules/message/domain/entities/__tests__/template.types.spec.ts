import { NotImplementedException } from '@nestjs/common'
import { ConfigService } from '../../../../../infrastructure/config/config.service'
import {
  MessageTemplateName,
  templateNameToAppUrl,
  templateNameToDashboardUrl,
} from '../template.types'

describe('template.types', () => {
  describe('templateNameToDashboardUrl', () => {
    it('should return the correct dashboard URL for ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION', () => {
      const messageTemplateName = MessageTemplateName.ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION
      const variables = {
        token: 'test-token',
        email: 'test-email@example.com',
      }
      const config = new ConfigService()

      const result = templateNameToDashboardUrl(messageTemplateName, variables, config)

      const expectedUrl = `${config.getStr('DASHBOARD_URL')}/register?token=test-token&email=test-email%40example.com`
      expect(result).toBe(expectedUrl)
    })

    it('should return the correct dashboard URL for ORGANIZATION_ADMIN_RESET_PASSWORD', () => {
      const messageTemplateName = MessageTemplateName.ORGANIZATION_ADMIN_RESET_PASSWORD
      const variables = {
        token: 'test-token',
        email: 'test-email@example.com',
      }
      const config = new ConfigService()

      const result = templateNameToDashboardUrl(messageTemplateName, variables, config)

      const expectedUrl = `${config.getStr('DASHBOARD_URL')}/reset_password?token=test-token&email=test-email%40example.com`
      expect(result).toBe(expectedUrl)
    })

    it('should throw NotImplementedException for unsupported message template names', () => {
      const messageTemplateName : MessageTemplateName = MessageTemplateName.CONFIRM_MANDATE
      const variables = {}
      const config = new ConfigService()

      expect(() =>
        templateNameToDashboardUrl(messageTemplateName, variables, config),
      ).toThrow(NotImplementedException)
    })
  })

  describe('templateNameToAppUrl', () => {
    it('should return the correct app URL for EMPLOYEE_NEW_LOGIN_TOKEN', () => {
      const messageTemplateName = MessageTemplateName.EMPLOYEE_NEW_LOGIN_TOKEN
      const variables = {
        token: 'test-token',
        email: 'test-email@example.com',
      }

      const result = templateNameToAppUrl(messageTemplateName, variables)

      const expectedUrl = `ekip://com.ekip.mobile/onboarding/token?token=test-token&email=test-email%40example.com`
      expect(result).toBe(expectedUrl)
    })

    it('should throw NotImplementedException for unsupported message template names', () => {
      const messageTemplateName : MessageTemplateName = MessageTemplateName.CONFIRM_MANDATE
      const variables = {}

      expect(() => templateNameToAppUrl(messageTemplateName, variables)).toThrow(
        NotImplementedException,
      )
    })
  })
})