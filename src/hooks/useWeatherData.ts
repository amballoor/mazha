import { useQuery } from '@tanstack/react-query'

const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=9.8674&longitude=76.4009&daily=temperature_2m_max,precipitation_probability_max&temperature_unit=celsius&timezone=auto'

type WeatherData = {
  precipitationPct: number | null
  tempMax: number | null
}

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(WEATHER_URL)
  if (!res.ok) throw new Error('Failed to fetch weather')
  const json = await res.json()
  return {
    precipitationPct: json.daily?.precipitation_probability_max?.[0] ?? null,
    tempMax: json.daily?.temperature_2m_max?.[0] ?? null,
  }
}

export function useWeatherData() {
  const { data, isLoading } = useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })
  return {
    precipitationPct: data?.precipitationPct ?? null,
    tempMax: data?.tempMax ?? null,
    isLoading,
  }
}
