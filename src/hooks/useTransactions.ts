import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService, type TransactionFilter } from '@/services/transactionService'

export const TRANSACTION_KEYS = {
  all: ['transactions'] as const,
  lists: () => [...TRANSACTION_KEYS.all, 'list'] as const,
  list: (filter: TransactionFilter) => [...TRANSACTION_KEYS.lists(), filter] as const,
  latest: () => [...TRANSACTION_KEYS.all, 'latest'] as const,
  detail: (id: number) => [...TRANSACTION_KEYS.all, id] as const,
}

export function useTransactions(filter: TransactionFilter = {}) {
  return useQuery({
    queryKey: TRANSACTION_KEYS.list(filter),
    queryFn: () => transactionService.getAll(filter),
  })
}

export function useLatestTransactions() {
  return useQuery({
    queryKey: TRANSACTION_KEYS.latest(),
    queryFn: () => transactionService.getLatest(),
  })
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: TRANSACTION_KEYS.detail(id),
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useCreateTransactionWithProof() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionService.createWithProof,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Parameters<typeof transactionService.update>[1]) =>
      transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
