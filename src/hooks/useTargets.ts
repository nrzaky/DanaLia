import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { targetService } from '@/services/targetService'

export const TARGET_KEYS = {
  all: ['targets'] as const,
  lists: () => [...TARGET_KEYS.all, 'list'] as const,
  detail: (id: number) => [...TARGET_KEYS.all, id] as const,
}

export function useTargets() {
  return useQuery({
    queryKey: TARGET_KEYS.lists(),
    queryFn: targetService.getAll,
  })
}

export function useCreateTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: targetService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: TARGET_KEYS.all }),
  })
}

export function useUpdateTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Parameters<typeof targetService.update>[1]) =>
      targetService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TARGET_KEYS.all }),
  })
}

export function useDeleteTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: targetService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: TARGET_KEYS.all }),
  })
}
