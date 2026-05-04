import AgentsClient from "./AgentsClient"


async function getAgents() {
  const res = await fetch(
    'https://valorant-api.com/v1/agents?isPlayableCharacter=true',
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.data
}

export default async function AgentsPage() {
  const agents = await getAgents()
  return <AgentsClient agents={agents} />
}