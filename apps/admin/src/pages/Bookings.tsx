import { useQuery } from '@tanstack/react-query'

export default function Bookings() {
  const { data } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => await (await fetch('/v1/rooms')).json()
  })
  return (
    <div style={{ padding: 24 }}>
      <h2>Rooms</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
