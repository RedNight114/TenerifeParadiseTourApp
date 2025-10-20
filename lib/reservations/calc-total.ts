export interface ReservationParticipantInput {
  price: number
}

export function calculateTotalAmountFromParticipants(participants: ReservationParticipantInput[]): number {
  if (!Array.isArray(participants) || participants.length === 0) return 0
  return participants.reduce((sum, p) => sum + (Number.isFinite(p.price) ? Number(p.price) : 0), 0)
}


