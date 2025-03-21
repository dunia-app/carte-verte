export interface QuontoTransactionResponse {
  transactions: QuontoTransaction[]
  meta: QuontoPaginationResponse
}

export interface QuontoTransaction {
  transaction_id: string
  amount: number
  side: string
  label: string
  settled_at: Date
  reference: string
  income: {
    counterparty_account_number: string
  }
}

export interface QuontoPaginationResponse {
  current_page: number
  next_page: number
  prev_page: number
  total_pages: number
  total_count: number
  per_page: number
}
