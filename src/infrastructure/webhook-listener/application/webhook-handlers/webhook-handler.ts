export abstract class WebhookHandler<PayloadType = unknown> {
  public abstract handle(
    objectId: string,
    payload: PayloadType,
  ): Promise<boolean>
}
