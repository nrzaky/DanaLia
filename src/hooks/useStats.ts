import { useQuery } from '@tanstack/react-query'
import { statsService } from '@/services/statsService'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsService.getStats,
  })
}
